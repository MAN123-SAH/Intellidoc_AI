# DocVQA Dataset

## What is it?
DocVQA is a Document Visual Question Answering dataset.
It is used in IntelliDoc AI to evaluate **Multimodal Document Understanding** — can the model locate and read specific values from a document given a question?

## Download
1. Go to: https://www.docvqa.org/
2. Register and download the dataset from the official portal.
3. Or from HuggingFace: https://huggingface.co/datasets/nielsr/docvqa_1200_examples
4. Place the extracted contents of the dataset in this folder.

## Expected Structure After Placement
```
docvqa/
    train/
        documents/
        train_v1.0.json
    val/
    test/
```

## Role in IntelliDoc
DocVQA → Multimodal Understanding Evaluation → Validates that models can locate values in documents
