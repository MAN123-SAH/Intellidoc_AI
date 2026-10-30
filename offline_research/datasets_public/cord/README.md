# CORD Dataset

## What is it?
CORD (Consolidated Receipt Dataset) is a receipt/document field understanding dataset.
It is used in IntelliDoc AI for **Invoice/Receipt Extraction development and evaluation**.

## Download
1. Go to: https://github.com/clovaai/cord
2. Or download from HuggingFace: https://huggingface.co/datasets/naver-clova-ix/cord-v2

3. Place the extracted contents of the dataset in this folder.

## Expected Structure After Placement
```
cord/
    train/
        images/
        json/
    dev/
    test/
```

## Role in IntelliDoc
CORD → Extraction Model Evaluation → Validates IntelliDoc field extraction on invoice-like docs
