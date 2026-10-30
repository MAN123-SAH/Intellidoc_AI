"""
IntelliDoc AI — CORD v2 Dataset Importer (Streaming Mode)
Downloads and extracts CORD v2 (Consolidated Receipt Dataset for Post-OCR Parsing)
Uses HuggingFace streaming to fetch exactly the requested receipt samples in seconds.
"""

import os
import json
from pathlib import Path
from datasets import load_dataset
from PIL import Image

def download_and_extract_cord(split_name: str = "test", num_samples: int = 20):
    base_dir = Path(__file__).resolve().parent
    output_dir = base_dir / split_name
    images_dir = output_dir / "images"
    annotations_dir = output_dir / "json"

    images_dir.mkdir(parents=True, exist_ok=True)
    annotations_dir.mkdir(parents=True, exist_ok=True)

    print(f"=== IntelliDoc AI: Fetching CORD v2 ({split_name} split, {num_samples} samples via Streaming) ===")
    
    # Load dataset in streaming mode so we don't download multi-gigabyte archives
    dataset = load_dataset("naver-clova-ix/cord-v2", split=split_name, streaming=True)
    
    saved_count = 0
    for idx, sample in enumerate(dataset.take(num_samples)):
        sample_id = f"cord_{split_name}_{idx:04d}"
        
        # 1. Save Image
        image: Image.Image = sample["image"]
        img_path = images_dir / f"{sample_id}.png"
        image.save(img_path)

        # 2. Parse Ground Truth JSON
        ground_truth = sample.get("ground_truth", {})
        if isinstance(ground_truth, str):
            try:
                ground_truth = json.loads(ground_truth)
            except Exception:
                ground_truth = {"raw": ground_truth}

        # 3. Save Structured Annotation
        ann_path = annotations_dir / f"{sample_id}.json"
        with open(ann_path, "w", encoding="utf-8") as f:
            json.dump({
                "id": sample_id,
                "split": split_name,
                "image_filename": f"{sample_id}.png",
                "image_width": image.width,
                "image_height": image.height,
                "ground_truth": ground_truth
            }, f, indent=2, ensure_ascii=False)

        saved_count += 1
        print(f"  [+] Saved {sample_id} ({image.width}x{image.height} px)")

    print(f"\n[SUCCESS] Saved {saved_count} CORD receipts to:")
    print(f"  Images:      {images_dir}")
    print(f"  Annotations: {annotations_dir}\n")

if __name__ == "__main__":
    download_and_extract_cord("test", num_samples=15)
