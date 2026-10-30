# Offline Model Evaluation

This directory contains offline evaluation scripts and references for benchmarking base vs. fine-tuned perception models before deployment to the runtime platform.

## Model Benchmarking Workflow
1. **Validation & Baselines**: Run [`../notebooks/01_funsd_dataset_validation.ipynb`](../notebooks/01_funsd_dataset_validation.ipynb) and [`../notebooks/02_layoutlmv3_baseline.ipynb`](../notebooks/02_layoutlmv3_baseline.ipynb) to inspect public dataset distributions and measure zero-shot extraction performance.
2. **Fine-Tuning**: Run [`../notebooks/03_layoutlmv3_finetune.ipynb`](../notebooks/03_layoutlmv3_finetune.ipynb) on GPU (Google Colab T4) to train `microsoft/layoutlmv3-base`.
3. **Validated Checkpoint**: Checkpoint weights are saved to [`../checkpoints/layoutlmv3_funsd/final_model/`](../checkpoints/layoutlmv3_funsd/final_model/) (501 MB) and mounted by the FastAPI backend runtime.
4. **End-to-End Quantitative Evaluation**: Run [`../../custom_benchmark/evaluation_scripts/run_benchmark.py`](../../custom_benchmark/evaluation_scripts/run_benchmark.py) to measure precision, recall, and verification accuracy across genuine and tampered documents.
