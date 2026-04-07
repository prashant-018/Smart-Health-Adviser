import pytesseract
from PIL import Image
import cv2

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
import configure_tesseract

configure_tesseract.ensure_tesseract()

def extract_text(image_path):

    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.medianBlur(gray, 3)
    text = pytesseract.image_to_string(gray)

    return text.strip()

if __name__ == "__main__":

    path = input("Enter image path: ")
    extracted_text = extract_text(path)
    print("Detected Text:", extracted_text)