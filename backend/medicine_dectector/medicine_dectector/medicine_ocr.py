def extract_text(image_path):
    raise RuntimeError(
        "OCR via Tesseract has been removed (not supported on Render). "
        "Use Groq vision on the image bytes instead."
    )

if __name__ == "__main__":

    path = input("Enter image path: ")
    extracted_text = extract_text(path)
    print("Detected Text:", extracted_text)