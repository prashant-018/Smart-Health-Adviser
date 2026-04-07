"""
Gemini AI helper using the new google-genai SDK.
If Gemini fails for any reason, caller falls back to original logic.
"""

import os
import io

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

_client = None

def _get_client():
    global _client
    if _client is None:
        if not GEMINI_API_KEY:
            raise RuntimeError("GEMINI_API_KEY is not set")

        # Use the official google-generativeai SDK (installed as `google-generativeai`)
        # Import path: `google.generativeai`
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        _client = genai
    return _client

MODEL = "gemini-2.5-flash"

def _generate(prompt: str) -> str:
    client = _get_client()
    response = client.GenerativeModel(MODEL).generate_content(prompt)
    return (getattr(response, "text", "") or "").strip()

def _generate_with_image(prompt: str, image_bytes: bytes, mime_type: str = "image/jpeg") -> str:
    client = _get_client()
    model = client.GenerativeModel(MODEL)
    response = model.generate_content(
        [
            {"mime_type": mime_type, "data": image_bytes},
            prompt,
        ]
    )
    return (getattr(response, "text", "") or "").strip()


# ─────────────────────────────────────────────────────────────────────────────
# 1. SYMPTOM CHAT
# ─────────────────────────────────────────────────────────────────────────────
def enrich_symptom_response(user_message: str, ml_disease: str,
                             ml_confidence: float, language: str) -> str:
    try:
        prompt = f"""You are a helpful medical AI assistant in a healthcare app.

The user described their symptoms: "{user_message}"
Our ML model predicted: {ml_disease} (confidence: {ml_confidence:.1f}%)

Your task:
1. Confirm or gently refine the prediction based on the symptoms.
2. List 3-4 key precautions the user should take.
3. Suggest 2-3 simple home remedies (supportive care only).
4. Clearly state: "Please consult a doctor for proper diagnosis."
5. Keep the tone warm, simple, and non-alarming.
6. Respond in {language} language (use English if unsure).
7. Do NOT suggest specific prescription medicines or dosages.

Format your response with these sections:
Possible Condition:
Precautions:
Home Care:
Doctor Advice:"""

        return _generate(prompt)
    except Exception as e:
        print(f"[Gemini] symptom enrichment failed: {e}")
        return ""


# ─────────────────────────────────────────────────────────────────────────────
# 2. SKIN DISEASE (Vision)
# ─────────────────────────────────────────────────────────────────────────────
def analyze_skin_with_gemini(image_bytes: bytes) -> dict:
    try:
        prompt = """You are a dermatology AI assistant. Analyze this skin image carefully.

Provide your response in this EXACT format:
CONDITION: [name of the most likely skin condition]
EMOJI: [one relevant emoji]
SEVERITY: [Mild / Moderate / Severe]
REASON: [one sentence explaining what you see in the image]
SUGGESTIONS:
- [suggestion 1]
- [suggestion 2]
- [suggestion 3]
- [suggestion 4]
- Always consult a dermatologist for accurate diagnosis and treatment.

Rules:
- Be conservative, do not diagnose serious conditions without clear evidence
- Always recommend seeing a dermatologist
- Do not suggest prescription medicines"""

        text = _generate_with_image(prompt, image_bytes)
        lines = text.split("\n")
        condition, emoji, reason, severity, suggestions = "Skin Condition Detected", "🔍", "Analyzed by Gemini Vision AI", "Unknown", []

        for line in lines:
            l = line.strip()
            if l.startswith("CONDITION:"):
                condition = l.replace("CONDITION:", "").strip()
            elif l.startswith("EMOJI:"):
                emoji = l.replace("EMOJI:", "").strip()
            elif l.startswith("SEVERITY:"):
                severity = l.replace("SEVERITY:", "").strip()
            elif l.startswith("REASON:"):
                reason = l.replace("REASON:", "").strip()
            elif l.startswith("- "):
                suggestions.append(l[2:])

        if not suggestions:
            suggestions = ["Consult a dermatologist for accurate diagnosis and treatment."]

        return {
            "condition": f"Possible {condition}",
            "emoji": emoji,
            "suggestions": suggestions,
            "reason": reason,
            "severity": severity,
            "analyzed_by": "Gemini Vision AI",
            "features": {}
        }
    except Exception as e:
        print(f"[Gemini] skin analysis failed: {e}")
        return {}


# ─────────────────────────────────────────────────────────────────────────────
# 3. LAB REPORT
# ─────────────────────────────────────────────────────────────────────────────
def analyze_lab_with_gemini(extracted_text: str) -> str:
    try:
        prompt = f"""You are a medical AI assistant helping patients understand their lab reports.

Extracted lab report text:
\"\"\"
{extracted_text[:3000]}
\"\"\"

Your task:
1. Identify all lab parameters (Hemoglobin, WBC, Glucose, etc.)
2. For each parameter state the value and whether it is Normal, Low, or High
3. Explain in simple language what each abnormal value might mean
4. Give 2-3 general health tips based on the results
5. End with: "Please consult your doctor to interpret these results properly."

Format with sections:
Lab Results Summary:
What This Means:
General Health Tips:
Important Note:"""

        return _generate(prompt)
    except Exception as e:
        print(f"[Gemini] lab report analysis failed: {e}")
        return ""


# ─────────────────────────────────────────────────────────────────────────────
# 4. MEDICINE (from OCR text)
# ─────────────────────────────────────────────────────────────────────────────
def identify_medicine_with_gemini(ocr_text: str) -> str:
    try:
        prompt = f"""You are a medical AI assistant helping patients understand their medicines.

Text extracted from medicine label:
\"\"\"
{ocr_text[:2000]}
\"\"\"

Provide:
Medicine: [name]
Uses: [what it treats in simple language]
Dosage: [general guidelines]
Side Effects: [common ones]
Warnings: [important precautions]
Note: Always follow your doctor's prescription."""

        return _generate(prompt)
    except Exception as e:
        print(f"[Gemini] medicine identification failed: {e}")
        return ""


# ─────────────────────────────────────────────────────────────────────────────
# 5. MEDICINE IMAGE (Vision)
# ─────────────────────────────────────────────────────────────────────────────
def identify_medicine_image_with_gemini(image_bytes: bytes) -> str:
    try:
        prompt = """You are a medical AI assistant. Look at this medicine packaging or label.

Identify and provide:
Medicine: [name of the medicine]
Uses: [what it is used for, in simple language]
Dosage: [general dosage information visible on the label]
Side Effects: [common side effects]
Warnings: [any warnings visible]
Note: Always follow your doctor's prescription and read the full package insert.

If you cannot clearly read the medicine name, say so and describe what you can see."""

        return _generate_with_image(prompt, image_bytes)
    except Exception as e:
        print(f"[Gemini] medicine image analysis failed: {e}")
        return ""
