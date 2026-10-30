# RVL-CDIP Dataset

## What is it?
RVL-CDIP (Ryerson Vision Lab Complex Document Information Processing) contains 400,000 grayscale document images in 16 classes.
It is used in IntelliDoc AI for **Document Classification model development and evaluation**.

## Download
1. Official: https://www.cs.cmu.edu/~aharley/rvl-cdip/
2. Or from HuggingFace: https://huggingface.co/datasets/rvl_cdip
3. Place the extracted contents of the dataset in this folder.

## Expected Structure After Placement
```
rvl_cdip/
    images/
    labels/
        train.txt
        val.txt
        test.txt
```

## Role in IntelliDoc
RVL-CDIP → Document Classification Training/Evaluation → Classifies documents as Invoice / PO / Certificate / etc.
