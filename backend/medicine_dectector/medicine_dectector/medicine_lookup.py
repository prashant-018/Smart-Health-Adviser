import os
import re
from typing import Optional

import pandas as pd
from rapidfuzz import fuzz
from deep_translator import GoogleTranslator

_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
_CSV_PATH = os.path.join(_BASE_DIR, "..", "medicine_database.csv")
df = pd.read_csv(_CSV_PATH)

# Minimum fuzzy score to accept a match (partial_ratio / token_set against OCR)
_MATCH_THRESHOLD = 62


def _safe_translate_to_en(text: str) -> str:
    text = (text or "").strip()
    if not text:
        return ""
    try:
        out = GoogleTranslator(source="auto", target="en").translate(text)
        return (out or text).strip()
    except Exception:
        return text


def _normalize(s: str) -> str:
    return " ".join(s.lower().split())


def _score_medicine_in_text(medicine_name: str, haystack: str) -> int:
    """Score how well a database medicine name appears in OCR-like text."""
    if not medicine_name or not haystack:
        return 0
    m = medicine_name.strip().lower()
    h = haystack.lower()
    # partial_ratio: short drug name vs long label (critical fix vs WRatio on full blob)
    pr = fuzz.partial_ratio(m, h)
    ts = fuzz.token_set_ratio(m, h)
    wr = fuzz.WRatio(m, h)
    return max(pr, ts, wr)


def _candidate_strings_from_ocr(raw: str) -> list[str]:
    """Build strings to match against (full text, lines, and word n-grams)."""
    raw = raw.strip()
    if not raw:
        return []
    parts = [_normalize(raw)]
    for line in raw.splitlines():
        line = line.strip()
        if len(line) >= 3:
            parts.append(_normalize(line))
    # tokens: help when OCR splits a name oddly
    tokens = re.findall(r"[A-Za-z0-9][A-Za-z0-9+.-]{2,}", raw)
    for t in tokens:
        if len(t) >= 4:
            parts.append(t.lower())
    for i in range(len(tokens) - 1):
        bigram = f"{tokens[i]} {tokens[i + 1]}"
        if len(bigram) >= 6:
            parts.append(bigram.lower())
    # de-dupe while preserving order
    seen = set()
    out = []
    for p in parts:
        if p and p not in seen:
            seen.add(p)
            out.append(p)
    return out


def _match_medicine(ocr_text: str, min_score: Optional[int] = None):
    """
    Returns (match_dict | None, meta) where meta has best_score, best_medicine, preview.
    """
    raw = (ocr_text or "").strip()
    preview = raw.replace("\n", " ").strip()
    if len(preview) > 160:
        preview = preview[:157] + "..."

    if not raw:
        return None, {
            "best_score": 0,
            "best_medicine": None,
            "preview": "",
            "reason": "no_text",
        }

    threshold = _MATCH_THRESHOLD if min_score is None else min_score

    translated = _safe_translate_to_en(raw)
    combined_haystack = _normalize(translated + " " + raw)

    medicine_list = df["medicine"].astype(str).tolist()

    best_med = None
    best_score = 0

    haystacks = _candidate_strings_from_ocr(raw)
    if translated and translated.lower() != raw.lower():
        haystacks.append(_normalize(translated))

    for hay in haystacks:
        for med in medicine_list:
            s = _score_medicine_in_text(med, hay)
            if s > best_score:
                best_score = s
                best_med = med

    # whole combined string pass (catches cases missed by line splits)
    for med in medicine_list:
        s = _score_medicine_in_text(med, combined_haystack)
        if s > best_score:
            best_score = s
            best_med = med

    if best_score >= threshold and best_med is not None:
        row = df[df["medicine"] == best_med].iloc[0]
        return (
            {
                "medicine": row["medicine"],
                "uses": row["uses"],
                "side_effects": row["side_effects"],
                "dosage": row["dosage"],
            },
            {
                "best_score": best_score,
                "best_medicine": best_med,
                "preview": preview,
                "reason": "ok",
            },
        )

    reason = "low_score"
    if not preview:
        reason = "no_text"
    elif best_score < 30:
        reason = "ocr_unclear_or_wrong_product"

    return None, {
        "best_score": best_score,
        "best_medicine": best_med,
        "preview": preview,
        "reason": reason,
    }


def get_medicine_info_with_meta(ocr_text, min_score: Optional[int] = None):
    """Same as get_medicine_info but returns (result_dict | None, meta) for error messages."""
    return _match_medicine(ocr_text, min_score=min_score)


def get_medicine_info(ocr_text, min_score: Optional[int] = None):
    result, _ = _match_medicine(ocr_text, min_score=min_score)
    return result


def format_medicine_not_found_reply(meta: dict) -> str:
    """Human-readable explanation when the database has no confident match."""
    preview = meta.get("preview") or "(empty)"
    score = meta.get("best_score", 0)
    best = meta.get("best_medicine")
    reason = meta.get("reason", "")

    lines = [
        "Medicine not found in the local database.",
        "",
        "Why: the app compares OCR text from your photo to a small built-in list of medicine names. "
        "Either the name on the pack is not in that list, the photo was too blurry, or the match score was too low.",
    ]
    if reason == "no_text":
        lines.append("No readable text was detected — try better lighting and focus on the brand/drug name.")
    else:
        lines.append(
            f"Best match score was {score}%"
            + (f" (closest name: {best})" if best else "")
            + f"; need about {_MATCH_THRESHOLD}%+ for a hit."
        )
        if preview and preview != "(empty)":
            lines.append(f'Detected text (excerpt): "{preview}"')
        lines.append(
            "Tip: photograph the strip/bottle label where the medicine name is printed largest, or add that drug to medicine_database.csv."
        )
    return "\n".join(lines)
