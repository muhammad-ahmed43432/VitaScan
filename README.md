VitaScan – Vitamin Deficiency Detection System

Overview:

VitaScan is an AI-powered system that detects vitamin deficiencies from images of skin, lips, tongue, and other relevant body parts.
It uses ResNet34 as a feature extractor and a custom classifier for 10 classes.

Goal: Early detection and monitoring of vitamin deficiencies to assist healthcare, wellness, and research.

Features / Use Cases

Healthcare Diagnostics: Early identification of deficiencies like vitamin A, B12, etc.

Remote Health Monitoring: Patients can upload images for assessment.

Preventive Health: Detect early warning signs and suggest dietary adjustments.

Research & Public Health: Analyze trends in communities.

Dataset

The dataset is organized as follows:

vitamin_deficiency/
├── train/
│   ├── angular_cheilitis/
│   ├── bitot_spots/
│   ├── glossitis/
│   ├── healthy_elbows/
│   ├── healthy_eye/
│   ├── healthy_lips/
│   ├── healthy_mouth/
│   ├── healthy_tongue/
│   ├── phrynoderma/
│   └── ulcer/
├── val/
│   └── ... (same subfolders)
└── test/
    └── ... (same subfolders)


Total classes: 10

Contains images of vitamin deficiency signs and healthy conditions.

Project Structure
.
├── train.py                # Train the model with Focal Loss & weighted sampler
├── retrain.py              # Retrain using previous weights
├── finetune.py             # Fine-tuning with targeted augmentation
├── model/                  # Saved models (.pth files)
├── utils.py                # Helper functions (dataset loading, augmentations)
└── README.md               # Project documentation

Installation

Clone the repository:

git clone https://github.com/yourusername/VitaScan.git
cd VitaScan


Install dependencies:

pip install torch torchvision numpy scikit-learn matplotlib tqdm pillow opencv-python


Ensure you have GPU support if available for faster training.

Usage
1. Training
python train.py


Uses ResNet34 as feature extractor

Custom classifier: Dropout + Linear layer for 10 classes

Focal Loss for handling hard examples

Weighted sampler for class imbalance

Saves best model based on validation loss

2. Retraining / Fine-Tuning
training.ipynb


Loads previous model weights and continues training

Applies targeted augmentation for weak classes

Evaluation

Accuracy, Precision, Recall, F1-score

Confusion matrix to visualize class-wise performance

Example test accuracy: XX% (replace with your results)
