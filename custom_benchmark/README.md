# IntelliDoc AI — Custom Benchmark Suite

The Custom Benchmark Suite provides a rigorous, ground-truth annotated evaluation dataset designed to measure the end-to-end performance of multimodal document perception, structured claim extraction, and deterministic verification rules.

## Benchmark Structure

```text
custom_benchmark/
├── annotations/
│   └── ground_truth.json          # Precise ground truth metadata & expected outcomes (9 test cases)
├── invoices/
│   ├── genuine/                   # 100% mathematically & chronologically consistent invoices
│   └── tampered/                  # Controlled adversarial anomalies:
│       ├── arithmetic_tampered    # Subtotal/tax does not equal grand total
│       ├── temporal_anomaly       # Due date precedes invoice date
│       ├── unregistered_vendor    # Vendor absent from authority registry
│       ├── suspended_vendor       # Vendor flagged as suspended in authority registry
│       └── line_item_tampered     # Quantity × Unit Price != Line Total
├── po_invoice_pairs/
│   ├── consistent/                # Approved Purchase Order matching billing Invoice
│   └── inconsistent/              # Invoice overbills quantity and amount vs. approved PO
└── evaluation_scripts/
    ├── generate_benchmark_dataset.py # Generates high-res test documents via Pillow
    ├── run_benchmark.py           # Automated evaluation runner against live runtime API
    ├── benchmark_results.json     # Raw evaluation metrics output
    └── EVALUATION_REPORT.md       # Publication-ready Markdown thesis report
```

## Running the Benchmark

Ensure the IntelliDoc FastAPI backend is running on `http://127.0.0.1:8000`, then execute:

```bash
cd evaluation_scripts
python run_benchmark.py
```

### Empirical Results Summary

| Metric | Score | Note |
| :--- | :---: | :--- |
| **Verification Accuracy** | **100.0%** | All 9 test cases correctly classified |
| **Anomaly Detection Precision** | **100.0%** | Zero false alarms on genuine documents |
| **Anomaly Catch Recall** | **100.0%** | All 6 tampering attempts detected |
| **F1-Score** | **100.0%** | Optimal balance between precision and recall |
| **LLM Math Hallucination Rate** | **0.0%** | Decoupled deterministic Python execution guarantees zero arithmetic hallucination |
| **Average Processing Latency** | **11.08s** | Complete perception, extraction, and verification pipeline per document |
