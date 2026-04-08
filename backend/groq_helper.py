import base64
import io
import os

import pdfplumber

_client = None
_configured_key = None


class GroqCallError(RuntimeError):
    def __init__(self, message: str, *, kind: str = "GROQ_ERROR"):
        super().__init__(message)
        self.kind = kind


def _get_api_key() -> str:
    return (os.environ.get("GROQ_API_KEY", "") or "").strip()


def _get_text_model() -> str:
    return (os.environ.get("GROQ_MODEL_TEXT", "") or "").strip() or "llama3-8b-8192"


def _get_vision_model() -> str:
    # Groq docs: vision examples use this model.
    return (os.environ.get("GROQ_MODEL_VISION", "") or "").strip() or "meta-llama/llama-4-scout-17b-16e-instruct"


def key_fingerprint() -> str:
    k = _get_api_key()
    if not k:
        return "missing"
    return f"len={len(k)} ...{k[-4:]}"


def _get_client():
    global _client, _configured_key

    api_key = _get_api_key()
    if not api_key:
        raise GroqCallError("GROQ_API_KEY is not set", kind="GROQ_NOT_CONFIGURED")

    if _client is None or _configured_key != api_key:
        from groq import Groq

        _client = Groq(api_key=api_key)
        _configured_key = api_key

    return _client


def _chat(prompt: str, *, system: str | None = None, model: str | None = None, max_tokens: int = 900) -> str:
    client = _get_client()
    m = model or _get_text_model()
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    try:
        resp = client.chat.completions.create(
            model=m,
            messages=messages,
            temperature=0.7,
            max_completion_tokens=max_tokens,
            top_p=1,
            stream=False,
        )
        return (resp.choices[0].message.content or "").strip()
    except Exception as e:
        raise GroqCallError(str(e) or "Groq request failed", kind="GROQ_REQUEST_FAILED")


# ─────────────────────────────────────────────────────────────────────────────
# 1) Symptom enrichment (ML + LLM)
# ─────────────────────────────────────────────────────────────────────────────
def enrich_symptom_response(user_message: str, ml_disease: str, ml_confidence: float, language: str) -> str:
    prompt = f"""You are a helpful medical AI assistant in a healthcare app.

User symptoms: "{user_message}"
ML model predicted: {ml_disease} (confidence: {ml_confidence:.1f}%)

Your task:
1. Confirm or gently refine the prediction based on the symptoms.
2. List 3-4 key precautions.
3. Suggest 2-3 simple home-care tips (supportive care only).
4. Clearly state: "Please consult a doctor for proper diagnosis."
5. Respond in {language} (use English if unsure).
6. Do NOT prescribe medicines or dosages.

Format:
Possible Condition:
Precautions:
Home Care:
Doctor Advice:
"""
    try:
        return _chat(prompt, system="You are a careful medical assistant.")
    except GroqCallError:
        return ""


# ─────────────────────────────────────────────────────────────────────────────
# 2) Skin image analysis (Vision)
# ─────────────────────────────────────────────────────────────────────────────
def analyze_skin_with_groq(image_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
    """
    Uses Groq vision-capable model. Returns a dict (same shape as your existing UI expects).
    """
    try:
        client = _get_client()
        model = _get_vision_model()

        b64 = base64.b64encode(image_bytes).decode("ascii")
        data_url = f"data:{mime_type};base64,{b64}"

        prompt = """You are a dermatology AI assistant. Analyze this skin image carefully.

Provide your response in this EXACT format:
CONDITION: [name of the most likely skin condition]
SEVERITY: [Mild / Moderate / Severe]
REASON: [one sentence explaining what you see]
SUGGESTIONS:
- [suggestion 1]
- [suggestion 2]
- [suggestion 3]
- Always consult a dermatologist for accurate diagnosis and treatment.

Rules:
- Be conservative, do not diagnose serious conditions without clear evidence.
- Do not prescribe medicines/dosages.
"""

        resp = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": data_url}},
                    ],
                }
            ],
            temperature=0.7,
            max_completion_tokens=700,
            top_p=1,
            stream=False,
        )

        text = (resp.choices[0].message.content or "").strip()
        if not text:
            return {}

        condition = "Skin Condition Detected"
        reason = "Analyzed by Groq Vision"
        severity = "Unknown"
        suggestions: list[str] = []

        for line in text.splitlines():
            l = line.strip()
            if l.startswith("CONDITION:"):
                condition = l.replace("CONDITION:", "").strip() or condition
            elif l.startswith("SEVERITY:"):
                severity = l.replace("SEVERITY:", "").strip() or severity
            elif l.startswith("REASON:"):
                reason = l.replace("REASON:", "").strip() or reason
            elif l.startswith("- "):
                suggestions.append(l[2:].strip())

        if not suggestions:
            suggestions = ["Consult a dermatologist for accurate diagnosis and treatment."]

        return {
            "condition": f"Possible {condition}",
            "emoji": "🔍",
            "suggestions": suggestions,
            "reason": reason,
            "severity": severity,
            "analyzed_by": "Groq Vision",
            "features": {},
        }
    except GroqCallError:
        return {}
    except Exception as e:
        raise GroqCallError(str(e) or "Groq vision request failed", kind="GROQ_REQUEST_FAILED")


# ─────────────────────────────────────────────────────────────────────────────
# 3) Lab report (PDF text OR image vision)
# ─────────────────────────────────────────────────────────────────────────────
def _extract_pdf_text(pdf_bytes: bytes) -> str:
    text = ""
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            text += (page.extract_text() or "") + "\n"
    return text.strip()


def analyze_lab_text_with_groq(extracted_text: str) -> str:
    prompt = f"""You are a medical AI assistant helping patients understand their lab reports.

Lab report text:
\"\"\"
{(extracted_text or '')[:6000]}
\"\"\"

Your task:
1) Identify parameters (Hemoglobin, WBC, Platelets, Glucose, Creatinine, etc.)
2) For each: value + unit (if present) + Normal/Low/High/Unknown (do not guess ranges)
3) Explain abnormal values in simple language
4) Give 2-3 general health tips
5) End with: "Please consult your doctor to interpret these results properly."

Format:
Lab Results Summary:
What This Means:
General Health Tips:
Important Note:
"""
    return _chat(prompt, system="You are a careful medical assistant.", max_tokens=1100)


def analyze_lab_document_with_groq(file_bytes: bytes, mime_type: str) -> str:
    """
    - PDFs: extract selectable text via pdfplumber, then analyze with a text model.
    - Images: send directly to a Groq vision model as a base64 data URL.
    """
    if mime_type == "application/pdf":
        text = _extract_pdf_text(file_bytes)
        if not text:
            raise GroqCallError(
                "Could not extract text from this PDF. Upload a text-based PDF or an image.",
                kind="PDF_TEXT_EXTRACTION_FAILED",
            )
        return analyze_lab_text_with_groq(text)

    if not mime_type.startswith("image/"):
        raise GroqCallError("Unsupported mime type", kind="UNSUPPORTED_MEDIA_TYPE")

    client = _get_client()
    model = _get_vision_model()
    b64 = base64.b64encode(file_bytes).decode("ascii")
    data_url = f"data:{mime_type};base64,{b64}"

    prompt = """You are a medical AI assistant helping patients understand lab reports.

You will be given a lab report as an image. Read it carefully and summarize:
- Extract lab parameters, values and units (if shown)
- Mark each as Normal/Low/High/Unknown (do not guess if ranges not visible)
- Explain abnormalities simply
- Give 2-3 general health tips
End with: "Please consult your doctor to interpret these results properly."

Do not prescribe medicines or dosages.
"""

    try:
        resp = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": data_url}},
                    ],
                }
            ],
            temperature=0.6,
            max_completion_tokens=1200,
            top_p=1,
            stream=False,
        )
        return (resp.choices[0].message.content or "").strip()
    except Exception as e:
        raise GroqCallError(str(e) or "Groq request failed", kind="GROQ_REQUEST_FAILED")


# ─────────────────────────────────────────────────────────────────────────────
# 4) Medicine image (Vision)
# ─────────────────────────────────────────────────────────────────────────────
def identify_medicine_image_with_groq(image_bytes: bytes, mime_type: str = "image/jpeg") -> str:
    client = _get_client()
    model = _get_vision_model()

    b64 = base64.b64encode(image_bytes).decode("ascii")
    data_url = f"data:{mime_type};base64,{b64}"

    prompt = """You are a medical AI assistant. Look at this medicine packaging or label.

Identify and provide:
Medicine: [name]
Uses: [simple]
Dosage: [only what is visible on label; otherwise say "Not visible"]
Side Effects: [common]
Warnings: [important]
Note: Always follow your doctor's prescription.

If you cannot clearly read the medicine name, say so and describe what you can see.
"""

    try:
        resp = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": data_url}},
                    ],
                }
            ],
            temperature=0.6,
            max_completion_tokens=700,
            top_p=1,
            stream=False,
        )
        return (resp.choices[0].message.content or "").strip()
    except Exception as e:
        raise GroqCallError(str(e) or "Groq vision request failed", kind="GROQ_REQUEST_FAILED")

