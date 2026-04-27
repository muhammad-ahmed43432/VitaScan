symptom_profiles = {
    "bitot_spots": {
        "deficiency": "Vitamin A",
        "risk_level": "High",
        "claim": "Strongly suggestive of Vitamin A deficiency risk.",
    },
    "phrynoderma": {
        "deficiency": "Vitamin A",
        "risk_level": "Moderate",
        "claim": "Suggestive of moderate Vitamin A deficiency risk based on visual pattern.",
    },
    "glossitis": {
        "deficiency": "Vitamin B12",
        "risk_level": "High",
        "claim": "Atrophic glossitis pattern shows high Vitamin B12 deficiency risk.",
    },
    "angular_cheilitis": {
        "deficiency": "Vitamin B12",
        "risk_level": "Moderate",
        "claim": "Angular cheilitis pattern indicates moderate Vitamin B12 deficiency risk.",
    },
    "ulcer": {
        "deficiency": "Vitamin B12",
        "risk_level": "Moderate",
        "claim": "Oral ulcer pattern indicates moderate Vitamin B12-associated risk.",
    },
    "healthy_elbows": {
        "deficiency": "Healthy",
        "risk_level": "Low",
        "claim": "No strong deficiency-associated visual sign detected.",
    },
    "healthy_eye": {
        "deficiency": "Healthy",
        "risk_level": "Low",
        "claim": "No strong deficiency-associated visual sign detected.",
    },
    "healthy_lips": {
        "deficiency": "Healthy",
        "risk_level": "Low",
        "claim": "No strong deficiency-associated visual sign detected.",
    },
    "healthy_mouth": {
        "deficiency": "Healthy",
        "risk_level": "Low",
        "claim": "No strong deficiency-associated visual sign detected.",
    },
    "healthy_tongue": {
        "deficiency": "Healthy",
        "risk_level": "Low",
        "claim": "No strong deficiency-associated visual sign detected.",
    },
}

# Backward-compatible mapping for existing code paths
symptom_to_deficiency = {
    symptom: profile["deficiency"] for symptom, profile in symptom_profiles.items()
}
