"""
IntelliDoc AI — CORD Dataset Validator & Statistical Profiler
Validates the unzipped CORD dataset structure, verifies image-JSON pairs,
computes semantic label distribution, and outputs a research verification report.
"""

import os
import json
from pathlib import Path
from collections import Counter
from PIL import Image

def validate_cord_dataset():
    cord_root = Path(__file__).resolve().parent
    splits = ["train", "dev", "test"]

    print("=" * 65)
    print(" IntelliDoc AI — CORD (Consolidated Receipt Dataset) Validator")
    print("=" * 65)
    print(f"Dataset Root: {cord_root}\n")

    overall_stats = {
        "dataset_name": "CORD (Consolidated Receipt Dataset for Post-OCR Parsing)",
        "total_receipts": 0,
        "splits": {},
        "categories_distribution": {},
        "arithmetic_fields_detected": {}
    }

    category_counter = Counter()
    arithmetic_fields = [
        "menu.nm", "menu.cnt", "menu.unitprice", "menu.price", 
        "sub_total.subtotal_price", "sub_total.tax_price", "sub_total.service_price",
        "total.total_price", "total.cashprice", "total.changeprice", "total.creditcardprice"
    ]
    arithmetic_counter = Counter()

    for split in splits:
        split_dir = cord_root / split
        img_dir = split_dir / "image"
        json_dir = split_dir / "json"

        if not split_dir.exists():
            print(f"[!] Split directory missing: {split_dir}")
            continue

        images = list(img_dir.glob("*.[pj][np][g]")) if img_dir.exists() else []
        jsons = list(json_dir.glob("*.json")) if json_dir.exists() else []

        print(f"[-] Split: {split.upper():<5} -> Images: {len(images):<5} | Annotations: {len(jsons):<5}")

        # Check pairing
        paired = 0
        split_tokens = 0
        for j_path in jsons:
            stem = j_path.stem
            # Matching image can be .png or .jpg
            has_img = (img_dir / f"{stem}.png").exists() or (img_dir / f"{stem}.jpg").exists()
            if has_img:
                paired += 1

            # Parse JSON annotations
            try:
                with open(j_path, "r", encoding="utf-8") as f:
                    data = json.load(f)

                valid_lines = data.get("valid_line", [])
                for line in valid_lines:
                    cat = line.get("category", "other")
                    category_counter[cat] += 1
                    if cat in arithmetic_fields:
                        arithmetic_counter[cat] += 1
                    split_tokens += len(line.get("words", []))
            except Exception as e:
                print(f"    [!] Error parsing {j_path.name}: {e}")

        overall_stats["splits"][split] = {
            "images_count": len(images),
            "annotations_count": len(jsons),
            "paired_receipts": paired,
            "total_word_tokens": split_tokens
        }
        overall_stats["total_receipts"] += paired

    overall_stats["categories_distribution"] = dict(category_counter.most_common(25))
    overall_stats["arithmetic_fields_detected"] = dict(arithmetic_counter.most_common())

    print("\n" + "-" * 65)
    print(f"[OK] Total Paired Receipts Verified: {overall_stats['total_receipts']}")
    print(f"[OK] Unique Semantic Categories:    {len(category_counter)}")
    print("-" * 65)

    print("\nTop 10 Semantic Categories in CORD:")
    for cat, count in category_counter.most_common(10):
        print(f"  • {cat:<28} : {count:>5} occurrences")

    print("\nFinancial & Line-Item Verification Fields in CORD:")
    for field in arithmetic_fields:
        count = arithmetic_counter[field]
        print(f"  • {field:<28} : {count:>5} tokens")

    # Save summary report
    summary_path = cord_root / "cord_summary.json"
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(overall_stats, f, indent=2)

    print(f"\n[SAVED] Research Summary Report -> {summary_path.name}")
    print("=" * 65)
    return overall_stats

if __name__ == "__main__":
    validate_cord_dataset()
