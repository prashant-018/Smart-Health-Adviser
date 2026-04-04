from os.path import splitext

import configure_tesseract

configure_tesseract.ensure_tesseract()

from flask import Flask, render_template, request, jsonify, session
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
from skin_disease_detector import analyze_skin_image
from deep_translator import GoogleTranslator

app = Flask(__name__)
app.secret_key = "healthcare_chatbot_secret_key_2024"

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
    """Detect language from text - supports major Indian languages"""
    # Hindi
    if any('\u0900' <= char <= '\u097F' for char in text):
        return "hi"
    # Tamil
    if any('\u0B80' <= char <= '\u0BFF' for char in text):
        return "ta"
    # Telugu
    if any('\u0C00' <= char <= '\u0C7F' for char in text):
        return "te"
    # Bengali
    if any('\u0980' <= char <= '\u09FF' for char in text):
        return "bn"
    # Gujarati
    if any('\u0A80' <= char <= '\u0AFF' for char in text):
        return "gu"
    # Kannada
    if any('\u0C80' <= char <= '\u0CFF' for char in text):
        return "kn"
    # Malayalam
    if any('\u0D00' <= char <= '\u0D7F' for char in text):
        return "ml"
    # Marathi (uses Devanagari like Hindi, check context)
    if any('\u0900' <= char <= '\u097F' for char in text):
        return "mr"
    # Punjabi (Gurmukhi script)
    if any('\u0A00' <= char <= '\u0A7F' for char in text):
        return "pa"
    return "en"

# Multi-language symptom aliases
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

symptom_map_ta = {
    "காய்ச்சல்": "fever",
    "தலைவலி": "headache",
    "வாந்தி": "vomiting",
    "தலைச்சுற்றல்": "dizziness",
    "இருமல்": "cough",
    "சளி": "cold",
    "சோர்வு": "fatigue",
    "வயிற்று வலி": "abdominal pain"
}

symptom_map_te = {
    "జ్వరం": "fever",
    "తలనొప్పి": "headache",
    "వాంతులు": "vomiting",
    "తల తిరగడం": "dizziness",
    "దగ్గు": "cough",
    "అలసట": "fatigue",
    "కడుపు నొప్పి": "abdominal pain"
}

symptom_map_bn = {
    "জ্বর": "fever",
    "মাথাব্যথা": "headache",
    "বমি": "vomiting",
    "মাথা ঘোরা": "dizziness",
    "কাশি": "cough",
    "ক্লান্তি": "fatigue",
    "পেট ব্যথা": "abdominal pain"
}

symptom_map_mr = {
    "ताप": "fever",
    "डोकेदुखी": "headache",
    "उलट्या": "vomiting",
    "चक्कर": "dizziness",
    "खोकला": "cough",
    "थकवा": "fatigue",
    "पोटदुखी": "abdominal pain"
}

symptom_map_gu = {
    "તાવ": "fever",
    "માથાનો દુખાવો": "headache",
    "ઉલટી": "vomiting",
    "ચક્કર": "dizziness",
    "ઉધરસ": "cough",
    "થાક": "fatigue",
    "પેટમાં દુખાવો": "abdominal pain"
}

symptom_map_kn = {
    "ಜ್ವರ": "fever",
    "ತಲೆನೋವು": "headache",
    "ವಾಂತಿ": "vomiting",
    "ತಲೆತಿರುಗುವಿಕೆ": "dizziness",
    "ಕೆಮ್ಮು": "cough",
    "ಆಯಾಸ": "fatigue",
    "ಹೊಟ್ಟೆ ನೋವು": "abdominal pain"
}

symptom_map_ml = {
    "പനി": "fever",
    "തലവേദന": "headache",
    "ഛർദ്ദി": "vomiting",
    "തലകറക്കം": "dizziness",
    "ചുമ": "cough",
    "ക്ഷീണം": "fatigue",
    "വയറുവേദന": "abdominal pain"
}

symptom_map_pa = {
    "ਬੁਖਾਰ": "fever",
    "ਸਿਰ ਦਰਦ": "headache",
    "ਉਲਟੀ": "vomiting",
    "ਚੱਕਰ": "dizziness",
    "ਖੰਘ": "cough",
    "ਥਕਾਵਟ": "fatigue",
    "ਪੇਟ ਦਰਦ": "abdominal pain"
}

# Map language codes to symptom dictionaries
LANGUAGE_SYMPTOM_MAPS = {
    "hi": symptom_map_hi,
    "ta": symptom_map_ta,
    "te": symptom_map_te,
    "bn": symptom_map_bn,
    "mr": symptom_map_mr,
    "gu": symptom_map_gu,
    "kn": symptom_map_kn,
    "ml": symptom_map_ml,
    "pa": symptom_map_pa,
}

# English aliases
symptom_alias = {
    "fever": "high_fever",
    "high fever": "high_fever",
    "mild fever": "mild_fever",
    "temperature": "high_fever",
    "headache": "headache",
    "head ache": "headache",
    "vomiting": "vomiting",
    "vomit": "vomiting",
    "nausea": "nausea",
    "cough": "cough",
    "cold": "continuous_sneezing",
    "sneezing": "continuous_sneezing",
    "stomach pain": "abdominal_pain",
    "abdominal pain": "abdominal_pain",
    "belly pain": "abdominal_pain",
    "tummy pain": "abdominal_pain",
    "fatigue": "fatigue",
    "tired": "fatigue",
    "weakness": "fatigue",
    "dizziness": "dizziness",
    "dizzy": "dizziness",
    "chills": "chills",
    "chill": "chills",
    "shivering": "chills",
    "runny nose": "runny_nose",
    "sore throat": "throat_irritation",
    "throat pain": "throat_irritation",
    "chest pain": "chest_pain",
    "joint pain": "joint_pain",
    "body ache": "muscle_pain",
    "muscle pain": "muscle_pain",
    "itching": "itching",
    "rash": "skin_rash",
    "skin rash": "skin_rash",
    "diarrhea": "diarrhoea",
    "loose motion": "diarrhoea",
    "loss of appetite": "loss_of_appetite",
    "no appetite": "loss_of_appetite",
    "blurred vision": "blurred_and_distorted_vision",
    "sweating": "sweating",
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

def collect_detected_symptoms(user_input):
    """Same symptom detection as disease prediction (aliases + fuzzy column match)."""
    detected_symptoms = []
    clean_input = user_input.lower()
    clean_input = clean_input.replace(",", " ")
    clean_input = clean_input.replace("  ", " ")

    for phrase, mapped in symptom_alias.items():
        if phrase in clean_input and mapped in columns:
            detected_symptoms.append(mapped)

    detected_symptoms += normalize_symptoms(clean_input, columns)
    return list(set(detected_symptoms))

# Typed chat is not OCR; fuzzy drug-name matching on long symptom text false-matches
# at the default ~62% threshold. Require a strong name match before returning medicine.
CHAT_MEDICINE_MIN_SCORE = 90

# Diseases that are common/mild and should be preferred when confidence is low
COMMON_DISEASES = {
    "Common Cold", "Allergy", "Fungal infection", "GERD",
    "Gastroenteritis", "Migraine", "Urinary tract infection",
    "Acne", "Psoriasis", "Hyperthyroidism", "Hypothyroidism",
    "Hypertension ", "Diabetes ", "Arthritis", "Osteoarthristis",
    "Peptic ulcer diseae", "Bronchial Asthma", "Drug Reaction",
    "Impetigo", "Varicose veins", "Dimorphic hemmorhoids(piles)",
    "(vertigo) Paroymsal  Positional Vertigo",
}

# Diseases that should NOT be shown unless confidence is very high
SERIOUS_DISEASES = {
    "AIDS", "Heart attack", "Paralysis (brain hemorrhage)",
    "Hepatitis B", "Hepatitis C", "Hepatitis D", "Hepatitis E",
    "hepatitis A", "Alcoholic hepatitis", "Tuberculosis",
    "Dengue", "Malaria", "Typhoid", "Jaundice",
    "Chronic cholestasis", "Cervical spondylosis",
    "Chicken pox", "Pneumonia",
}

# Minimum confidence to show a serious disease
SERIOUS_DISEASE_MIN_CONFIDENCE = 40.0
# Minimum confidence to show any prediction (else ask for more symptoms)
MIN_PREDICTION_CONFIDENCE = 10.0

# Disease function
def predict_disease(detected_symptoms, language):
    """Predict disease from a list of already-detected symptom column names."""

    if len(detected_symptoms) < 1:
        messages = {
            "hi": "कृपया अपने लक्षण बताइए (जैसे बुखार, सिर दर्द, खांसी).",
            "ta": "உங்கள் அறிகுறிகளை விவரிக்கவும் (எ.கா. காய்ச்சல், தலைவலி, இருமல்).",
            "te": "దయచేసి మీ లక్షణాలను వివరించండి (ఉదా. జ్వరం, తలనొప్పి, దగ్గు).",
            "bn": "আপনার লক্ষণগুলি বর্ণনা করুন (যেমন জ্বর, মাথাব্যথা, কাশি).",
            "mr": "कृपया तुमची लक्षणे सांगा (उदा. ताप, डोकेदुखी, खोकला).",
            "gu": "કૃપા કરીને તમારા લક્ષણો વર્ણવો (દા.ત. તાવ, માથાનો દુખાવો, ઉધરસ).",
            "kn": "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಲಕ್ಷಣಗಳನ್ನು ವಿವರಿಸಿ (ಉದಾ. ಜ್ವರ, ತಲೆನೋವು, ಕೆಮ್ಮು).",
            "ml": "നിങ്ങളുടെ ലക്ഷണങ്ങൾ വിവരിക്കുക (ഉദാ. പനി, തലവേദന, ചുമ).",
            "pa": "ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਲੱਛਣ ਦੱਸੋ (ਜਿਵੇਂ ਬੁਖਾਰ, ਸਿਰ ਦਰਦ, ਖੰਘ).",
            "en": "Please describe your symptoms (e.g., fever, headache, cough).",
        }
        return messages.get(language, messages["en"]), 0

    input_data = pd.DataFrame(np.zeros((1, len(columns))), columns=columns)
    for symptom in detected_symptoms:
        if symptom in columns:
            input_data.at[0, symptom] = 1

    probabilities = model.predict_proba(input_data)[0]
    diseases = model.classes_
    
    # Build ranked list with STRONG common-disease boost
    ranked = []
    for i, disease in enumerate(diseases):
        conf = probabilities[i] * 100
        # Boost common diseases by 3x when confidence is low (to push them into top 5)
        if disease in COMMON_DISEASES and conf < 30 and conf > 1:
            conf *= 3.0
        ranked.append((disease, conf, i))

    # Sort by boosted confidence
    ranked.sort(key=lambda x: x[1], reverse=True)
    top_5 = ranked[:5]

    main_disease, confidence, _ = top_5[0]

    # If top result is a serious disease but confidence is too low, skip to next
    if main_disease in SERIOUS_DISEASES and confidence < SERIOUS_DISEASE_MIN_CONFIDENCE:
        for disease, conf, _ in top_5[1:]:
            if disease not in SERIOUS_DISEASES or conf >= SERIOUS_DISEASE_MIN_CONFIDENCE:
                main_disease, confidence = disease, conf
                break

    # If overall confidence is still too low, ask for more symptoms
    if confidence < MIN_PREDICTION_CONFIDENCE:
        messages = {
            "hi": "कृपया अधिक लक्षण बताइए (जैसे उल्टी, चक्कर, थकान).",
            "ta": "மேலும் அறிகுறிகளை வழங்கவும் (எ.கா. வாந்தி, தலைச்சுற்றல், சோர்வு).",
            "te": "మరిన్ని లక్షణాలను అందించండి (ఉదా. వాంతులు, తల తిరగడం, అలసట).",
            "bn": "আরও লক্ষণ প্রদান করুন (যেমন বমি, মাথা ঘোরা, ক্লান্তি).",
            "mr": "अधिक लक्षणे द्या (उदा. उलट्या, चक्कर, थकवा).",
            "gu": "વધુ લક્ષણો આપો (દા.ત. ઉલટી, ચક્કર, થાક).",
            "kn": "ಹೆಚ್ಚಿನ ಲಕ್ಷಣಗಳನ್ನು ನೀಡಿ (ಉದಾ. ವಾಂತಿ, ತಲೆತಿರುಗುವಿಕೆ, ಆಯಾಸ).",
            "ml": "കൂടുതൽ ലക്ഷണങ്ങൾ നൽകുക (ഉദാ. ഛർദ്ദി, തലകറക്കം, ക്ഷീണം).",
            "pa": "ਹੋਰ ਲੱਛਣ ਦਿਓ (ਜਿਵੇਂ ਉਲਟੀ, ਚੱਕਰ, ਥਕਾਵਟ).",
            "en": "Please provide more symptoms for a better diagnosis (e.g., vomiting, dizziness, fatigue).",
        }
        return messages.get(language, messages["en"]), 0

    similar = [d for d, c, _ in top_5[1:3] if d != main_disease]

    remedy_lines = get_home_remedies_for_disease(main_disease)
    remedies_block = "\n".join(f"- {line}" for line in remedy_lines)

    response = f"""Possible disease: {main_disease}
Confidence: {round(confidence, 1)}%

Precautions:
{', '.join(precautions.get(main_disease, ['Consult a doctor']))}

Basic home care (supportive only — not a replacement for medical care):
{remedies_block}

Other possible conditions: {', '.join(similar) if similar else 'None'}"""

    if language != "en":
        try:
            response = GoogleTranslator(source="en", target=language).translate(response)
        except:
            pass  # If translation fails, return English

    return response, confidence

@app.route("/")
def home():
    return render_template("chat.html")

@app.route("/chat", methods=["POST"])
def chat():

    print("CHAT ROUTE HIT")

    body = request.json or {}
    user_input = body.get("message", "")

    if not user_input:
        return jsonify({"reply": "Please type something."})

    language = detect_language(user_input)
    translated_input = user_input.lower()

    if language != "en":
        # Get language-specific symptom map
        symptom_map = LANGUAGE_SYMPTOM_MAPS.get(language, {})
        for native_word, en_word in symptom_map.items():
            if native_word in translated_input:
                translated_input += " " + en_word
        
        # Translate to English for processing
        try:
            translated_input = GoogleTranslator(source=language, target="en").translate(translated_input)
        except:
            pass  # If translation fails, continue with original

    clean_input = translated_input.replace(",", " ").lower()
    print("Processed input:", clean_input)

    medicine_result = get_medicine_info(clean_input, min_score=CHAT_MEDICINE_MIN_SCORE)
    if medicine_result:
        response = f"""Medicine: {medicine_result['medicine']}

Uses: {medicine_result['uses']}

Dosage: {medicine_result['dosage']}

Side Effects: {medicine_result['side_effects']}"""
        if language != "en":
            try:
                response = GoogleTranslator(source="en", target=language).translate(response)
            except:
                pass
        return jsonify({"reply": response})

    try:
        # Detect symptoms from this message
        detected_symptoms = collect_detected_symptoms(clean_input)
        print("Detected symptoms:", detected_symptoms)

        if not detected_symptoms:
            msg = "I couldn't detect any symptoms. Please describe what you're feeling (e.g., fever, headache, cough)."
            if language == "hi":
                msg = GoogleTranslator(source="en", target="hi").translate(msg)
            return jsonify({"reply": msg, "confidence": 0})

        disease_result, confidence = predict_disease(detected_symptoms, language)
        return jsonify({"reply": disease_result, "confidence": confidence})

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

def _phones_from_contact_block(contact):
    """Collect phone strings from a Geoapify contact object."""
    if not isinstance(contact, dict):
        return []
    found = []
    main = contact.get("phone")
    if main:
        found.append(str(main).strip())
    for extra in contact.get("phone_other") or []:
        if extra:
            found.append(str(extra).strip())
    intl = contact.get("phone_international")
    if isinstance(intl, dict):
        for v in intl.values():
            if v:
                found.append(str(v).strip())
    return [p for p in found if p]


def _phones_from_place_details_json(data):
    """Parse phones from a Place Details API GeoJSON response."""
    phones = []
    for feat in (data or {}).get("features", []):
        pr = feat.get("properties") or {}
        if pr.get("feature_type") != "details":
            continue
        phones.extend(_phones_from_contact_block(pr.get("contact")))
    # de-dupe, keep order
    seen = set()
    out = []
    for p in phones:
        if p not in seen:
            seen.add(p)
            out.append(p)
    return out


def _place_details_request(params, api_key):
    import requests

    q = dict(params)
    q["apiKey"] = api_key
    r = requests.get(
        "https://api.geoapify.com/v2/place-details",
        params=q,
        timeout=25,
    )
    r.raise_for_status()
    return r.json()


def _hospital_phone_from_geoapify(props, api_key):
    """
    Place Details by place_id first; if no contact, retry by coordinates (sometimes
    resolves a different record with phone). Merges phone + phone_other + phone_international.
    """
    place_id = props.get("place_id")
    lat = props.get("lat")
    lon = props.get("lon")

    for attempt in ("id", "coords"):
        try:
            if attempt == "id":
                if not place_id:
                    continue
                data = _place_details_request({"id": place_id}, api_key)
            else:
                if lat is None or lon is None:
                    continue
                data = _place_details_request({"lat": lat, "lon": lon}, api_key)
            phones = _phones_from_place_details_json(data)
            if phones:
                return "; ".join(phones)
        except Exception:
            continue
    return ""

@app.route("/nearby_hospitals")
def nearby_hospitals():

    import requests
    from concurrent.futures import ThreadPoolExecutor

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

    response = requests.get(url, timeout=30).json()

    features = response.get("features", [])
    place_ids = [p.get("properties", {}).get("place_id") for p in features]

    phones = []
    if features:
        from functools import partial

        workers = min(6, len(features))
        fetch = partial(_hospital_phone_from_geoapify, api_key=API_KEY)
        with ThreadPoolExecutor(max_workers=workers) as pool:
            phones = list(pool.map(fetch, [p["properties"] for p in features]))

    hospitals = []

    for place, phone in zip(features, phones if len(phones) == len(features) else [""] * len(features)):

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
            "phone": phone or "",
            "maps_link": maps_link
        })

    if not hospitals:
        hospitals = [{
            "name": "No hospitals found within 15 km radius",
            "distance": "",
            "rating": "",
            "phone": "",
            "maps_link": ""
        }]

    resp = jsonify({"hospitals": hospitals})
    resp.headers["Cache-Control"] = "no-store, max-age=0"
    resp.headers["Pragma"] = "no-cache"
    return resp

@app.route("/detect_skin_disease", methods=["POST"])
def detect_skin_disease():
    try:
        if "image" not in request.files:
            return jsonify({"error": "No image file received."}), 400
        file = request.files["image"]
        if not file or not getattr(file, "filename", None):
            return jsonify({"error": "No file selected."}), 400

        image_bytes = file.read()
        result = analyze_skin_image(image_bytes)
        return jsonify(result)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Could not process image: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)