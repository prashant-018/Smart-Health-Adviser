import pdfplumber
import re


# Reference ranges
NORMAL_RANGES = {
    "hemoglobin": (13, 17),
    "hb": (13, 17),
    "wbc": (4000, 11000),
    "total wbc": (4000, 11000),
    "platelet": (150000, 450000),
    "platelet count": (150000, 450000),
    "glucose": (70, 140),
    "blood sugar": (70, 140),
    "creatinine": (0.7, 1.3),
    "urea": (7, 20),
    "cholesterol": (125, 200)
}

def extract_text_from_pdf(filepath):

    text = ""

    with pdfplumber.open(filepath) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""

    return text.lower()


def extract_text_from_image(filepath):
    raise RuntimeError(
        "Image-to-text extraction via Tesseract has been removed. "
        "Use Groq-based direct lab report analysis instead."
    )


import re


def analyze_lab_report(text):

    PARAMETER_MAP = {
        "hemoglobin": ["hemoglobin", "hb"],
        "wbc": ["wbc", "total wbc"],
        "platelet": ["platelet", "platelet count"],
        "glucose": ["glucose", "blood glucose"],
        "creatinine": ["creatinine"]
    }

    NORMAL_RANGES = {
        "hemoglobin": (13, 17),
        "wbc": (4000, 11000),
        "platelet": (150000, 450000),
        "glucose": (70, 140),
        "creatinine": (0.7, 1.3)
    }

    text = re.sub(r"\s+", " ", text.lower())

    results = []
    interpretation = []

    for param, aliases in PARAMETER_MAP.items():

        for alias in aliases:

            match = re.search(rf"{alias}.*?(\d+\.?\d*)", text)

            if match:

                value = float(match.group(1))
                low, high = NORMAL_RANGES[param]

                if value < low:
                    status = "LOW"
                    interpretation.append(
                        f"{param.capitalize()} is below normal → possible mild deficiency"
                    )

                elif value > high:
                    status = "HIGH"
                    interpretation.append(
                        f"{param.capitalize()} is elevated → consult physician if persistent"
                    )

                else:
                    status = "NORMAL"

                results.append(
                    f"{param.capitalize()}: {status} ({value})"
                )

                break

    if not results:
        return "Could not detect major lab parameters."

    final_output = "Lab Report Analysis\n\n"

    final_output += "\n".join(results)

    if interpretation:
        final_output += "\n\nMedical Interpretation:\n"
        final_output += "\n".join([f"• {line}" for line in interpretation])

    return final_output