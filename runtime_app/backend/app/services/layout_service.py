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
    Supports either FUNSD (form understanding) or CORD (receipt line-items).
    """
    global _MODEL, _PROCESSOR
    if _MODEL is not None and _PROCESSOR is not None:
        return _MODEL, _PROCESSOR

    import torch
    from transformers import LayoutLMv3ForTokenClassification, LayoutLMv3Processor

    path = Path(checkpoint_path) if checkpoint_path else DEFAULT_CHECKPOINT_PATH

    # Dynamic fallback based on repository root relative to this file
    if not path.exists():
        repo_root = Path(__file__).resolve().parents[4]
        candidate = repo_root / "offline_research" / "checkpoints" / "layoutlmv3_funsd" / "final_model"
        if candidate.exists():
            path = candidate

    print(f"[LayoutService] Loading LayoutLMv3 model from {path}...")
    _PROCESSOR = LayoutLMv3Processor.from_pretrained(str(path), apply_ocr=False)
    _MODEL = LayoutLMv3ForTokenClassification.from_pretrained(str(path))
    _MODEL.eval()
    print(f"[LayoutService] LayoutLMv3 model loaded successfully with {len(_MODEL.config.id2label)} classes: {list(_MODEL.config.id2label.values())}")

    return _MODEL, _PROCESSOR


def classify_document_layout(
    image_path: str,
    ocr_tokens: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Runs LayoutLMv3 inference on OCR tokens extracted from an image.
    
    Args:
        image_path: Path to rendered page PNG
        ocr_tokens: List of tokens containing 'text', 'bbox', 'normalized_bbox', 'confidence'
        
    Returns:
        List of augmented tokens with 'layout_label' ('header', 'question', 'answer', 'other')
    """
    if not ocr_tokens:
        return []

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
