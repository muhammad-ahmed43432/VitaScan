import torch
import torch.nn as nn
from torchvision import models

class_names = [
    'angular_cheilitis',
    'bitot_spots',
    'glossitis',
    'healthy_elbows',
    'healthy_eye',
    'healthy_lips',
    'healthy_mouth',
    'healthy_tongue',
    'phrynoderma',
    'ulcer'
]

def load_model():
    model = models.resnet34()
    model.fc = nn.Sequential(
        nn.Dropout(0.5),
        nn.Linear(model.fc.in_features, 10)
    )

    state_dict = torch.load("models/finalized_resnet_best_model.pth", map_location=torch.device('cpu'))
    model.load_state_dict(state_dict, strict=False)

    model.eval()
    return model