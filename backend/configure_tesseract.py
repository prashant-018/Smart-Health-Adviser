"""
Ensure pytesseract can find the Tesseract executable on Windows and when PATH
differs between CMD and the Flask process.
"""
import os
import shutil

import pytesseract


def ensure_tesseract():
    """Prefer PATH, then TESSERACT_CMD, then common Windows install paths; keep prior cmd if valid."""
    which = shutil.which("tesseract")
    if which:
        pytesseract.pytesseract.tesseract_cmd = which
        return

    env_path = os.environ.get("TESSERACT_CMD")
    if env_path and os.path.isfile(env_path):
        pytesseract.pytesseract.tesseract_cmd = env_path
        return

    if os.name == "nt":
        for path in (
            r"C:\Program Files\Tesseract-OCR\tesseract.exe",
            r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
        ):
            if os.path.isfile(path):
                pytesseract.pytesseract.tesseract_cmd = path
                return

    cmd = getattr(pytesseract.pytesseract, "tesseract_cmd", None)
    if isinstance(cmd, str) and os.path.isfile(cmd):
        return
