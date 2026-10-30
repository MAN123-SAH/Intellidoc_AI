import os
from datasets import load_dataset
from tqdm import tqdm

def download_huggingface_dataset(dataset_name: str, split: str, output_dir: str, num_samples: int = 10):
    """
    Downloads a subset of a HuggingFace dataset to verify the pipeline.
    """
    print(f"Loading {dataset_name} ({split} split)...")
    try:
        # Load the dataset in streaming mode or just a subset so we don't download GBs of data blindly
        dataset = load_dataset(dataset_name, split=f"{split}[:{num_samples}]")
        
        save_path = os.path.join(output_dir, dataset_name.replace("/", "_"))
        os.makedirs(save_path, exist_ok=True)
        
        # Save to disk as HuggingFace dataset format
        dataset.save_to_disk(save_path)
        print(f"Successfully saved {num_samples} samples of {dataset_name} to {save_path}\n")
    except Exception as e:
        print(f"Failed to load {dataset_name}: {e}\n")

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(base_dir, "data_samples")
    
    print("=== IntelliDoc AI: Public Dataset Acquisition ===")
    print(f"Output Directory: {output_dir}\n")
    
    # 1. Layout Understanding (DocLayNet)
    # Note: Using 'nielsr/doclaynet' or 'pierreguillou/DocLayNet-small' as common HF versions
    download_huggingface_dataset("pierreguillou/DocLayNet-small", "validation", output_dir, num_samples=5)
    
    # 2. Receipt / Invoice Extraction (CORD)
    download_huggingface_dataset("naver-clova-ix/cord-v2", "validation", output_dir, num_samples=5)
    
    # 3. Form Understanding (FUNSD)
    download_huggingface_dataset("nielsr/funsd", "test", output_dir, num_samples=5)
    
    # 4. Document VQA (DocVQA)
    download_huggingface_dataset("nielsr/docvqa_1200_examples", "test", output_dir, num_samples=5)

    print("Sample acquisition complete. These samples can be used to evaluate the Pretrained Model Baseline.")
    print("For full model training, remove the `num_samples` limit in this script.")

if __name__ == "__main__":
    main()
