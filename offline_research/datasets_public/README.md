# IntelliDoc AI — Public Datasets Guide

This folder contains one subdirectory per public dataset used in the IntelliDoc AI offline research pipeline.

## Dataset Directory Overview

| Folder       | Dataset     | Purpose in IntelliDoc                     | Download Link |
|--------------|-------------|-------------------------------------------|---------------|
| `doclaynet/` | DocLayNet   | Layout model training & evaluation        | https://huggingface.co/datasets/ds4sd/DocLayNet |
| `cord/`      | CORD v2     | Invoice/receipt extraction evaluation     | https://huggingface.co/datasets/naver-clova-ix/cord-v2 |
| `funsd/`     | FUNSD       | Key-value / form field understanding      | https://guillaumejaume.github.io/FUNSD/ |
| `docvqa/`    | DocVQA      | Multimodal document understanding         | https://www.docvqa.org/ |
| `rvl_cdip/`  | RVL-CDIP    | Document classification                   | https://huggingface.co/datasets/rvl_cdip |
| `sroie/`     | SROIE       | OCR accuracy & field extraction           | https://huggingface.co/datasets/darentang/sroie |
| `doctamper/` | DocTamper   | Forensic/tampering model training         | https://github.com/qcf-568/DocTamper |

## How to Use

1. **Download** your chosen dataset from the link above.
2. **Extract** the files into the corresponding subfolder (e.g., `cord/train/`, `funsd/testing_data/`).
3. Each folder has its own `README.md` with the exact expected structure.
4. Once placed, run the evaluation scripts in `../model_evaluation/` to benchmark the pretrained models.

## Important Note
These datasets are **NEVER sent to the IntelliDoc Runtime at inference time.**

The flow is:
```
Dataset → Offline Model Evaluation / Fine-tuning → Model Checkpoint → IntelliDoc Runtime
```
