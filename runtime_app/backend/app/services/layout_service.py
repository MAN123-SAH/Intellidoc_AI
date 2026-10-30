import os
from pathlib import Path
from typing import List, Dict, Any, Optional
from PIL import Image

# Global model cache to avoid reloading on every request
_MODEL = None
_PROCESSOR = None

DEFAULT_CHECKPOINT_PATH = Path(
    os.getenv(
        "LAYOUTLMV3_CHECKPOINT",
        "../../offline_research/checkpoints/layoutlmv3_funsd/final_model"
    )
).resolve()


CORD_CHECKPOINT_PATH = Path(
    os.getenv(
        "LAYOUTLMV3_CORD_CHECKPOINT",
        "../../offline_research/checkpoints/layoutlmv3_cord/final_model"
    )
).resolve()


def get_layout_model(checkpoint_path: Optional[str] = None):
    """
    Lazily loads the fine-tuned LayoutLMv3 model and processor into memory once.
    Supports either local fine-tuned weights or automatic HuggingFace Hub fallback.
    """
    global _MODEL, _PROCESSOR
    if _MODEL is not None and _PROCESSOR is not None:
        return _MODEL, _PROCESSOR

    import torch
    from transformers import LayoutLMv3ForTokenClassification, LayoutLMv3Processor

    # 1. Check user-specified or environment path
    target = checkpoint_path or os.getenv("LAYOUTLMV3_CHECKPOINT")
    if target and Path(target).exists() and (Path(target) / "config.json").exists():
        model_source = str(target)
    else:
        # 2. Check local relative directory safely (without assuming fixed parents count)
        candidate = None
        for p in Path(__file__).resolve().parents:
            chk = p / "offline_research" / "checkpoints" / "layoutlmv3_funsd" / "final_model"
            if chk.exists() and (chk / "config.json").exists():
                candidate = str(chk)
                break
        
        # 3. If no local checkpoint found (e.g. in cloud container), load standard Hugging Face model
        model_source = candidate or os.getenv("LAYOUTLMV3_HUB_MODEL", "nielsr/layoutlmv3-finetuned-funsd")

    print(f"[LayoutService] Loading LayoutLMv3 model from {model_source}...")
    _PROCESSOR = LayoutLMv3Processor.from_pretrained(model_source, apply_ocr=False)
    _MODEL = LayoutLMv3ForTokenClassification.from_pretrained(model_source)
    _MODEL.eval()
    print(f"[LayoutService] LayoutLMv3 loaded successfully with {len(_MODEL.config.id2label)} classes.")

    return _MODEL, _PROCESSOR


def classify_document_layout(
    image_path: str,
    ocr_tokens: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Runs LayoutLMv3 inference on OCR tokens extracted from an image.
    If model inference fails or is unavailable, falls back gracefully to OCR tokens.
    """
    if not ocr_tokens:
        return []

    try:
        import torch
        model, processor = get_layout_model()

        with Image.open(image_path) as img:
            image = img.convert("RGB")

        words = [t["text"] for t in ocr_tokens]
        boxes = [t["normalized_bbox"] for t in ocr_tokens]

        # LayoutLMv3 handles max 512 tokens. Truncate / chunk if necessary:
        max_words = 400
        words_chunk = words[:max_words]
        boxes_chunk = boxes[:max_words]

        encoding = processor(
            image,
            words_chunk,
            boxes=boxes_chunk,
            return_tensors="pt",
            truncation=True,
            padding="max_length",
            max_length=512,
        )

        with torch.no_grad():
            outputs = model(**encoding)

        logits = outputs.logits  # shape: (1, seq_len, num_classes)
        predictions = torch.argmax(logits, dim=-1).squeeze().tolist()

        id2label = model.config.id2label

        # Map sub-word tokens back to original word tokens
        word_ids = encoding.word_ids(batch_index=0)
        word_labels: Dict[int, str] = {}

        for idx, word_idx in enumerate(word_ids):
            if word_idx is None:
                continue
            if word_idx not in word_labels:
                pred_id = predictions[idx]
                label = id2label.get(pred_id, id2label.get(str(pred_id), "other"))
                word_labels[word_idx] = label

        # Assign layout labels to original ocr_tokens
        annotated_tokens = []
        for i, token in enumerate(ocr_tokens):
            lbl = word_labels.get(i, "other")
            annotated_tokens.append({
                **token,
                "layout_label": lbl,
            })

        return annotated_tokens

    except Exception as e:
        print(f"[LayoutService] LayoutLMv3 inference notice: {e}. Falling back to default token labeling.")
        # Graceful fallback: return tokens with heuristic or default labels
        annotated_tokens = []
        for i, token in enumerate(ocr_tokens):
            annotated_tokens.append({
                **token,
                "layout_label": token.get("layout_label", "token"),
            })
        return annotated_tokens
