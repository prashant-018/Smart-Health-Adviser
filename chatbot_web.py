from os.path import splitext

import configure_tesseract

configure_tesseract.ensure_tesseract()

from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import numpy as np
from disease_model.precautions import precautions
from disease_model.home_remedies import get_home_remedies_for_disease
from medicine_dectector.medicine_ocr import extract_text
from medicine_dectector.medicine_lookup import (
    get_medicine_info,
    get_medicine_info_with_meta,
    format_medicine_not_found_reply,
)
from lab_report_analyzer import (
    extract_text_from_pdf,
    extract_text_from_image,
    analyze_lab_report
)
from deep_translator import GoogleTranslator

app = Flask(__name__)

_FRONTEND_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
# Do not restrict allow_headers: multipart/form-data preflights need the right headers.
# Upload routes catch exceptions and return JSON so responses still get CORS headers.
CORS(
    app,
    origins=_FRONTEND_ORIGINS,
    supports_credentials=True,
    allow_headers="*",
    methods=["GET", "HEAD", "POST", "OPTIONS", "PUT", "DELETE"],
)

#model loading
model = pickle.load(open("disease_model/model.pkl", "rb"))
columns = pickle.load(open("disease_model/symptom_columns.pkl", "rb"))

# Hindi Support
def detect_language(text):
    for char in text:
        if '\u0900' <= char <= '\u097F':
            return "hi"
    return "en"

# Hindi aliases
symptom_map_hi = {
    "बुखार": "fever",
    "तेज बुखार": "high fever",
    "हल्का बुखार": "mild fever",
    "सिर दर्द": "headache",
    "सर दर्द": "headache",
    "उल्टी": "vomiting",
    "चक्कर": "dizziness",
    "खांसी": "cough",
    "सर्दी": "cough",
    "नाक बहना": "runny nose",
    "ठंड लगना": "chills",
    "थकान": "fatigue",
    "पेट दर्द": "abdominal pain"
}

# English aliases
symptom_alias = {
    "fever": "high_fever",
    "high fever": "high_fever",
    "mild fever": "mild_fever",
    "temperature": "high_fever",

    "headache": "headache",
    "vomiting": "vomiting",
    "cough": "cough",
    "cold": "continuous_sneezing",
    "stomach pain": "abdominal_pain",
    "fatigue": "fatigue",
    "dizziness": "dizziness"
}

from rapidfuzz import fuzz

def normalize_symptoms(user_text, columns):

    detected = []
    text = user_text.lower()

    # some synonyms
    synonym_map = {
        "fever": ["high_fever", "mild_fever"],
        "stomach pain": ["abdominal_pain"],
        "belly pain": ["abdominal_pain"],
        "tummy pain": ["abdominal_pain"],
        "cold": ["continuous_sneezing"],
        "runny nose": ["runny_nose"],
        "joint pain": ["joint_pain"],
        "headache": ["headache"],
        "abdominal pain": ["abdominal_pain"],
        "vomiting": ["vomiting"],
        "fatigue": ["fatigue"],
        "dizziness": ["dizziness"]
    }

    # synonym matching
    for phrase, mapped_list in synonym_map.items():
        if phrase in text:
            for mapped in mapped_list:
                if mapped in columns:
                    detected.append(mapped)

    # dataset matching
    formatted_columns = [c.replace("_", " ") for c in columns]
    for col, formatted in zip(columns, formatted_columns):
        score = fuzz.partial_ratio(formatted, text)

        if score > 90:
            detected.append(col)

    return list(set(detected))

# Disease function
def predict_disease(user_input, language):

    detected_symptoms = []
    clean_input = user_input.lower()
    clean_input = clean_input.replace(",", " ")
    clean_input = clean_input.replace("  ", " ")
    

    #for alias priority first
    for phrase, mapped in symptom_alias.items():
        if phrase in clean_input and mapped in columns:
            detected_symptoms.append(mapped)

    # fuzzy + dataset detection
    detected_symptoms += normalize_symptoms(clean_input, columns)
    detected_symptoms = list(set(detected_symptoms))
    print("Final symptoms used:", detected_symptoms)

    if len(detected_symptoms) < 2:

        if language == "hi":
            return "कृपया एक और लक्षण बताइए (जैसे सिर दर्द, उल्टी, चक्कर).", 0

        return "Please provide one more symptom (example: headache, vomiting, dizziness).", 0

    input_data = pd.DataFrame(
        np.zeros((1, len(columns))),
        columns=columns
    )

    for symptom in detected_symptoms:
        input_data.at[0, symptom] = 1

    probabilities = model.predict_proba(input_data)[0]
    max_probability = max(probabilities)
    confidence = round(max_probability * 100, 2)
    diseases = model.classes_
    top_indices = probabilities.argsort()[-3:][::-1]
    main_disease = diseases[top_indices[0]]
    confidence = probabilities[top_indices[0]] * 100
    similar = [diseases[i] for i in top_indices[1:]]

    remedy_lines = get_home_remedies_for_disease(main_disease)
    remedies_block = "\n".join(f"- {line}" for line in remedy_lines)

    response = f"""
        Possible disease: {main_disease}
        Confidence: {round(confidence,2)}%

        Precautions:
        {', '.join(precautions.get(main_disease, ['Consult doctor']))}

        Basic home care (supportive only—not a replacement for medical care):
        {remedies_block}

        Other possible diseases:
        {', '.join(similar)}
        """

    if language == "hi":
        response = GoogleTranslator(
            source="en",
            target="hi"
        ).translate(response)

    return response, confidence

@app.route("/")
def home():
    return render_template("chat.html")

@app.route("/chat", methods=["POST"])
def chat():

    print("CHAT ROUTE HIT")

    user_input = request.json.get("message", "")

    if not user_input:
        return jsonify({"reply": "Please type something."})

    language = detect_language(user_input)

    translated_input = user_input.lower()

    # Hindi → English conversion
    if language == "hi":

        for hi_word, en_word in symptom_map_hi.items():
            if hi_word in translated_input:
                translated_input += " " + en_word

        translated_input = GoogleTranslator(
            source="hi",
            target="en"
        ).translate(translated_input)

    clean_input = translated_input.replace(",", " ").lower()

    print("Processed input:", clean_input)

    # Try medicine detection first
    medicine_result = get_medicine_info(clean_input)

    if medicine_result:

        response = f"""
Medicine: {medicine_result['medicine']}

Uses: {medicine_result['uses']}

Dosage: {medicine_result['dosage']}

Side Effects: {medicine_result['side_effects']}
"""

        if language == "hi":
            response = GoogleTranslator(
                source="en",
                target="hi"
            ).translate(response)

        return jsonify({"reply": response})

    # Otherwise run disease prediction
    try:
        disease_result, confidence = predict_disease(clean_input, language)
        return jsonify({
            "reply": disease_result,
            "confidence": confidence
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"reply": str(e)})

@app.route("/upload_medicine_image", methods=["POST"])
def upload_medicine_image():
    try:
        if "image" not in request.files:
            return jsonify({"reply": "No image file received. Choose a file first."}), 400
        file = request.files["image"]
        if not file or not getattr(file, "filename", None):
            return jsonify({"reply": "No file selected."}), 400

        filepath = "temp.jpg"
        file.save(filepath)

        extracted_text = extract_text(filepath)
        print("OCR detected:", extracted_text)
        result, meta = get_medicine_info_with_meta(extracted_text)

        if result:
            response = f"""
            Medicine: {result['medicine']}
            Uses: {result['uses']}
            Dosage: {result['dosage']}
            Side Effects: {result['side_effects']}
        """
            return jsonify({"reply": response})

        return jsonify({"reply": format_medicine_not_found_reply(meta)})
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"reply": f"Could not process image: {str(e)}"}), 500

@app.route("/upload_lab_report", methods=["POST"])
def upload_lab_report():
    try:
        if "file" not in request.files:
            return jsonify({"reply": "No file received. Choose a file first."}), 400
        file = request.files["file"]
        if not file or not getattr(file, "filename", None):
            return jsonify({"reply": "No file selected."}), 400

        filename = file.filename.lower()

        ext = splitext(filename)[1].lower()
        if not ext:
            return jsonify({
                "reply": "File must have an extension (e.g. .pdf, .png, .jpg)."
            }), 400
        if ext not in (".pdf", ".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tif", ".tiff"):
            return jsonify({
                "reply": "Unsupported file type. Upload a PDF or image (JPG, PNG, WEBP, etc.)."
            }), 400

        if ext == ".jpeg":
            ext = ".jpg"

        filepath = f"temp_report{ext}"

        if ext == ".pdf":
            file.save(filepath)
            text = extract_text_from_pdf(filepath)
        else:
            file.save(filepath)
            text = extract_text_from_image(filepath)

        summary = analyze_lab_report(text)

        return jsonify({"reply": summary})
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"reply": f"Could not process report: {str(e)}"}), 500

@app.route("/nearby_hospitals")
def nearby_hospitals():

    import requests

    lat = request.args.get("lat")
    lng = request.args.get("lng")

    API_KEY = "1f7c9b1ed0324088b5b7d9811e0a6f04"

    url = (
        f"https://api.geoapify.com/v2/places"
        f"?categories=healthcare.hospital"
        f"&filter=circle:{lng},{lat},15000"
        f"&bias=proximity:{lng},{lat}"
        f"&limit=6"
        f"&apiKey={API_KEY}"
    )

    response = requests.get(url).json()

    hospitals = []

    for place in response.get("features", []):

        props = place["properties"]

        name = props.get("name", "Unnamed hospital")

        distance_m = props.get("distance", 0)
        distance_km = round(distance_m / 1000, 2)

        rating = props.get("rating", "N/A")

        lat_h = props.get("lat")
        lon_h = props.get("lon")

        maps_link = f"https://www.google.com/maps?q={lat_h},{lon_h}"

        hospitals.append({
            "name": name,
            "distance": distance_km,
            "rating": rating,
            "maps_link": maps_link
        })

    if not hospitals:
        hospitals = [{
            "name": "No hospitals found within 15 km radius",
            "distance": "",
            "rating": "",
            "maps_link": ""
        }]

    return jsonify({"hospitals": hospitals})

if __name__ == "__main__":
    app.run(debug=True)