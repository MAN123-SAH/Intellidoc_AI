# IntelliDoc AI — Offline Research Notebooks

This folder contains Google Colab notebooks for the **offline model research** phase of IntelliDoc AI.

Run these notebooks on **Google Colab** with GPU acceleration.

---

## Complete Notebook Catalog

### Track A: FUNSD (Forms Understanding)
| # | File | Purpose | When to Run |
|---|------|---------|-------------|
| 1 | `01_funsd_dataset_validation.ipynb` | Load, inspect & visualize FUNSD forms | First (Validation) |
| 2 | `02_layoutlmv3_baseline.ipynb` | Evaluate pretrained LayoutLMv3 on FUNSD | Baseline score recording |
| 3 | `03_layoutlmv3_finetune.ipynb` | Fine-tune LayoutLMv3 on FUNSD (saves 501MB checkpoint) | Final model training |

### Track B: CORD (Receipt & Invoice Line-Items)
| # | File | Purpose | When to Run |
|---|------|---------|-------------|
| 4 | `04_cord_dataset_validation.ipynb` | Load, inspect 30 categories & run arithmetic audits on CORD | First (Validation) |
| 5 | `05_layoutlmv3_cord_baseline.ipynb` | Pretrained LayoutLMv3 baseline scores on CORD receipts | Baseline score recording |
| 6 | `06_layoutlmv3_cord_finetune.ipynb` | Fine-tune LayoutLMv3 on CORD receipts & save checkpoint | Final model training |

---

## How to Run on Google Colab

1. Open [Google Colab](https://colab.research.google.com).
2. Click **File → Upload notebook**.
3. Upload any notebook from `offline_research/notebooks/`.
4. Select GPU: **Runtime → Change runtime type → T4 GPU**.
5. Ensure your Google Drive has the datasets:
   - FUNSD: `MyDrive/funsd/` or `MyDrive/Intellidoc_AI/datasets_public/funsd/`
   - CORD: `MyDrive/Intellidoc_AI/datasets_public/cord/`
6. Run cells from top to bottom using **Shift + Enter**.
