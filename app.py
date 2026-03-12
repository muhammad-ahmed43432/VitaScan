from flask import Flask, render_template, request
import torch
from torchvision import transforms
from PIL import Image
import io

from model import load_model, class_names
from mapping import symptom_to_deficiency

app = Flask(__name__)

# Load model once at startup
model = load_model()

# Image preprocessing
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor()
])

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return render_template("index.html", prediction="No file uploaded")

    file = request.files["file"]

    if file.filename == "":
        return render_template("index.html", prediction="No file selected")

    try:
        image = Image.open(io.BytesIO(file.read())).convert("RGB")
        image = transform(image).unsqueeze(0)

        with torch.no_grad():
            outputs = model(image)
            _, predicted = torch.max(outputs, 1)
            predicted_class = class_names[predicted.item()]

        vitamin_result = symptom_to_deficiency[predicted_class]

        final_result = f"Detected: {predicted_class.replace('_', ' ').title()} | Category: {vitamin_result}"

        return render_template("index.html", prediction=final_result)

    except Exception as e:
        return render_template("index.html", prediction=f"Error: {str(e)}")


if __name__ == "__main__":
    app.run(debug=True)