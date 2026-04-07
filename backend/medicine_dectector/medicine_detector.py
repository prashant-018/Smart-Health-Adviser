from medicine_ocr import extract_text
from medicine_lookup import get_medicine_info

image_path = input("Upload medicine image path: ")
text = extract_text(image_path)

print("Detected text:", text)
result = get_medicine_info(text)

if result:
    print("\nMedicine:", result["medicine"])
    print("Uses:", result["uses"])
    print("Side Effects:", result["side_effects"])
    print("Dosage:", result["dosage"])

else:
    print("\nMedicine not found in database")
