# DocTamper Dataset

## What is it?
DocTamper is a document image tampering detection dataset.
It is used in IntelliDoc AI to train and evaluate the **Forensic Model** that detects visual text/image manipulation in documents.

## Download
1. Official paper & repo: https://github.com/qcf-568/DocTamper
2. Request access from the authors via the GitHub repo (it is a research dataset).
3. Place the extracted contents of the dataset in this folder.

## Expected Structure After Placement
```
doctamper/
    images/
        original/
        tampered/
    masks/           # Ground truth manipulation masks
    annotations.json
```

## Role in IntelliDoc
DocTamper → Forensic Model Training/Fine-tuning → Detects visual anomalies → Evidence signal in IntelliDoc Runtime

## IMPORTANT
Forensic signals are INDICATORS, not definitive proof of fraud.
The forensic model output feeds into Evidence Fusion, not directly into the final Decision.
