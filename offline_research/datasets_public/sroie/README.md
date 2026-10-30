# SROIE Dataset

## What is it?
SROIE (Scanned Receipts OCR and Information Extraction) is from the ICDAR 2019 challenge.
It contains scanned receipts and is used in IntelliDoc AI for **OCR and Field Extraction evaluation**.

## Download
1. Go to: https://rrc.cvc.uab.es/?ch=13
2. Or from HuggingFace: https://huggingface.co/datasets/darentang/sroie
3. Place the extracted contents of the dataset in this folder.

## Expected Structure After Placement
```
sroie/
    train/
        images/
        boxes_and_transcripts/
        entities/
    test/
```

## Role in IntelliDoc
SROIE → OCR & Extraction Evaluation → Validates OCR accuracy (CER, WER) and field extraction (Exact Match, F1)
