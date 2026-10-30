from typing import List, Dict, Any, Tuple
from pathlib import Path
from PIL import Image
import pytesseract
from pytesseract import Output


def run_ocr_on_image(image_path: str) -> Tuple[List[Dict[str, Any]], int, int]:
    """
    Extracts text tokens and bounding box coordinates from an image using Tesseract OCR.
    
    Returns:
        tokens: List of dicts with keys:
            - text: str
            - bbox: [x0, y0, x1, y1] (pixel coordinates)
            - normalized_bbox: [nx0, ny0, nx1, ny1] (0-1000 scale for LayoutLMv3)
            - confidence: float (0.0 - 1.0)
            - line_num: int
        width: int
        height: int
    """
    path = Path(image_path)
    if not path.exists():
        raise FileNotFoundError(f"Image not found at {image_path}")

    with Image.open(path) as img:
        img_rgb = img.convert("RGB")
        width, height = img_rgb.size

        # Run Tesseract OCR with detailed word-level data
        data = pytesseract.image_to_data(img_rgb, output_type=Output.DICT)

    tokens: List[Dict[str, Any]] = []
    n_boxes = len(data["text"])

    for i in range(n_boxes):
        text = data["text"][i].strip()
        conf = float(data["conf"][i])

        # Skip empty words or failed recognitions (conf == -1)
        if not text or conf < 0:
            continue

        x = data["left"][i]
        y = data["top"][i]
        w = data["width"][i]
        h = data["height"][i]

        x0 = max(0, x)
        y0 = max(0, y)
        x1 = min(width, x + w)
        y1 = min(height, y + h)

        # Normalize to 0 - 1000 range for LayoutLMv3
        nx0 = max(0, min(1000, int(1000 * (x0 / width))))
        ny0 = max(0, min(1000, int(1000 * (y0 / height))))
        nx1 = max(0, min(1000, int(1000 * (x1 / width))))
        ny1 = max(0, min(1000, int(1000 * (y1 / height))))

        tokens.append({
            "text": text,
            "bbox": [x0, y0, x1, y1],
            "normalized_bbox": [nx0, ny0, nx1, ny1],
            "confidence": round(conf / 100.0, 4),
            "line_num": data["line_num"][i],
        })

    return tokens, width, height
