
import numpy as np
from PIL import Image, ImageFilter
import io


SKIN_CONDITIONS = {
    "acne": {
        "condition": "Possible Acne / Pimples",
        "emoji": "🔴",
        "suggestions": [
            "Wash face twice daily with a gentle, non-drying cleanser.",
            "Avoid touching or popping pimples — it causes scarring.",
            "Use non-comedogenic (oil-free) moisturizers and sunscreen.",
            "Try over-the-counter benzoyl peroxide or salicylic acid.",
            "Change pillowcases frequently and keep hair off your face.",
            "See a dermatologist if acne is severe or leaves dark marks.",
        ],
    },
    "rash": {
        "condition": "Possible Skin Rash / Irritation",
        "emoji": "🟠",
        "suggestions": [
            "Avoid scratching — it worsens irritation and risks infection.",
            "Apply a fragrance-free moisturizer to soothe the skin.",
            "Use mild, unscented soap and lukewarm water for washing.",
            "Identify and avoid triggers (fabrics, soaps, certain foods).",
            "Over-the-counter hydrocortisone cream may reduce mild inflammation.",
            "See a doctor if the rash spreads, blisters, or persists over a week.",
        ],
    },
    "dry_flaky": {
        "condition": "Possible Dry / Flaky Skin (Eczema or Psoriasis)",
        "emoji": "🟡",
        "suggestions": [
            "Moisturize immediately after bathing while skin is still damp.",
            "Use thick creams or ointments rather than thin lotions.",
            "Avoid hot showers — use lukewarm water instead.",
            "Wear soft, breathable fabrics like cotton.",
            "Use a humidifier in dry environments.",
            "Consult a dermatologist for prescription treatments if severe.",
        ],
    },
    "dark_spots": {
        "condition": "Possible Hyperpigmentation / Dark Spots",
        "emoji": "⚫",
        "suggestions": [
            "Apply broad-spectrum SPF 30+ sunscreen every day.",
            "Avoid picking at skin — it worsens pigmentation.",
            "Look for serums with vitamin C, niacinamide, or kojic acid.",
            "Avoid prolonged sun exposure without protection.",
            "Monitor any moles using the ABCDE rule (Asymmetry, Border, Color, Diameter, Evolving).",
            "See a dermatologist if spots change shape, color, or bleed.",
        ],
    },
    "fungal": {
        "condition": "Possible Fungal Infection",
        "emoji": "🟤",
        "suggestions": [
            "Keep the affected area clean and thoroughly dry.",
            "Apply over-the-counter antifungal cream (clotrimazole or miconazole).",
            "Avoid sharing towels, clothing, or personal items.",
            "Wear breathable, loose-fitting clothing.",
            "Complete the full course of treatment even if it clears early.",
            "See a doctor if it doesn't improve within 2 weeks.",
        ],
    },
    "general": {
        "condition": "Skin Condition Detected",
        "emoji": "🔍",
        "suggestions": [
            "Keep the affected area clean and avoid harsh soaps.",
            "Moisturize regularly with a fragrance-free lotion.",
            "Avoid scratching or picking at the skin.",
            "Apply SPF 30+ sunscreen if the area is exposed to sun.",
            "Monitor for changes in size, color, or texture over time.",
            "Consult a dermatologist for an accurate diagnosis and treatment.",
        ],
    },
}


def _extract_features(img: Image.Image) -> dict:
    """Extract color and texture features from a PIL image."""
    img_rgb = img.convert("RGB").resize((128, 128))
    arr = np.array(img_rgb, dtype=np.float32)

    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]

    mean_r = float(np.mean(r))
    mean_g = float(np.mean(g))
    mean_b = float(np.mean(b))

    # Redness ratio: how much red dominates over green/blue
    redness = mean_r / (mean_g + mean_b + 1e-5)

    # Darkness: low overall brightness
    brightness = (mean_r + mean_g + mean_b) / 3.0

    # Texture variance: high variance = rough/uneven skin
    gray = np.mean(arr, axis=2)
    texture_variance = float(np.var(gray))

    # Spot detection: count pixels significantly darker than mean (spots/moles)
    dark_threshold = brightness * 0.55
    dark_pixel_ratio = float(np.mean(gray < dark_threshold))

    # Uniformity: std of brightness across image
    uniformity = float(np.std(gray))

    # Edge density via simple gradient (flaky/rough skin has more edges)
    img_gray = img_rgb.convert("L")
    edges = img_gray.filter(ImageFilter.FIND_EDGES)
    edge_arr = np.array(edges, dtype=np.float32)
    edge_density = float(np.mean(edge_arr))

    return {
        "mean_r": mean_r,
        "mean_g": mean_g,
        "mean_b": mean_b,
        "redness": redness,
        "brightness": brightness,
        "texture_variance": texture_variance,
        "dark_pixel_ratio": dark_pixel_ratio,
        "uniformity": uniformity,
        "edge_density": edge_density,
    }


def _classify(features: dict) -> tuple[str, str]:
    """
    Rule-based classifier. Returns (condition_key, reason).
    Tuned for typical skin photo characteristics.
    """
    r = features["redness"]
    brightness = features["brightness"]
    variance = features["texture_variance"]
    dark_ratio = features["dark_pixel_ratio"]
    edge_density = features["edge_density"]
    uniformity = features["uniformity"]

    # High redness + high texture variance → acne / inflamed skin
    if r > 0.80 and variance > 900:
        return "acne", f"High redness ({r:.2f}) with uneven texture"

    # High redness + moderate variance → rash / irritation
    if r > 0.75:
        return "rash", f"Elevated redness ratio ({r:.2f})"

    # High edge density + high variance → dry/flaky/scaly skin
    if edge_density > 18 and variance > 1200:
        return "dry_flaky", f"High edge density ({edge_density:.1f}) suggesting flaky texture"

    # Significant dark spots against lighter background
    if dark_ratio > 0.18 and brightness > 90:
        return "dark_spots", f"Dark spot coverage {dark_ratio*100:.1f}% on lighter skin"

    # Low brightness overall + patchy uniformity → possible fungal / discoloration
    if brightness < 90 and uniformity > 45:
        return "fungal", f"Low brightness ({brightness:.1f}) with patchy distribution"

    # High variance alone → general uneven skin
    if variance > 1500:
        return "rash", f"High texture variance ({variance:.0f})"

    return "general", "No specific pattern strongly matched"


def analyze_skin_image(image_bytes: bytes) -> dict:
    """
    Analyze skin image bytes and return condition + suggestions.
    Returns dict: condition, emoji, suggestions, features, reason
    """
    try:
        img = Image.open(io.BytesIO(image_bytes))
        features = _extract_features(img)
        condition_key, reason = _classify(features)
        info = SKIN_CONDITIONS[condition_key]

        return {
            "condition": info["condition"],
            "emoji": info["emoji"],
            "suggestions": info["suggestions"],
            "reason": reason,
            "features": {
                "redness_ratio": round(features["redness"], 3),
                "brightness": round(features["brightness"], 1),
                "texture_variance": round(features["texture_variance"], 1),
                "edge_density": round(features["edge_density"], 1),
                "dark_spot_ratio": round(features["dark_pixel_ratio"] * 100, 1),
            },
        }

    except Exception as e:
        return {
            "condition": "Analysis Failed",
            "emoji": "❌",
            "suggestions": [
                "Could not analyze the image.",
                "Please upload a clear, well-lit photo of the affected skin area.",
                "Supported formats: JPG, PNG, WEBP.",
            ],
            "error": str(e),
        }
