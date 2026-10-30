# DocLayNet Dataset

## What is it?
DocLayNet is a human-annotated document layout dataset with 80,863 pages and 11 layout classes.
It is used in IntelliDoc AI for **Layout Model development and evaluation**.

## Download
1. Go to: https://github.com/DS4SD/DocLayNet
2. Or download from HuggingFace: https://huggingface.co/datasets/ds4sd/DocLayNet
3. Place the extracted contents of the dataset in this folder.

## Expected Structure After Placement
```
doclaynet/
    train/
    val/
    test/
    labels.json
```

## Role in IntelliDoc
DocLayNet → Layout Model Training/Fine-tuning → LayoutLMv3 checkpoint → IntelliDoc Runtime
