# FUNSD Dataset

## What is it?
FUNSD (Form Understanding in Noisy Scanned Documents) is a form understanding dataset.
It is used in IntelliDoc AI for **Key-Value / Form Field Understanding evaluation**.

## Download
1. Go to: https://guillaumejaume.github.io/FUNSD/
2. Direct download: https://guillaumejaume.github.io/FUNSD/dataset.zip
3. Or from HuggingFace: https://huggingface.co/datasets/nielsr/funsd
4. Place the extracted contents of the dataset in this folder.

## Expected Structure After Placement
```
funsd/
    training_data/
        images/
        annotations/
    testing_data/
        images/
        annotations/
```

## Role in IntelliDoc
FUNSD → Layout & Key-Value Understanding Evaluation → Validates IntelliDoc layout model
