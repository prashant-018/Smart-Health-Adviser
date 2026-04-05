import pickle
import pandas as pd
import numpy as np
from precautions import precautions
from deep_translator import GoogleTranslator

model = pickle.load(open("model.pkl", "rb"))
columns = pickle.load(open("symptom_columns.pkl", "rb"))

symptom_alias = {
    "head hurts": "headache",
    "stomach pain": "abdominal_pain",
    "throwing up": "vomiting",
    "tired": "fatigue",
    "high temperature": "fever"
}

hindi_symptoms = {
    "बुखार": "fever",
    "उल्टी": "vomiting",
    "सिर दर्द": "headache",
    "थकान": "fatigue",
    "खांसी": "cough",
    "सीने में दर्द": "chest_pain"
}

user_input = input("Enter symptoms / लक्षण लिखें: ")

def detect_language(text):
    for char in text:
        if '\u0900' <= char <= '\u097F':
            return "hi"
    return "en"

detected_language = detect_language(user_input)

if detected_language == "hi":
    translated_input = GoogleTranslator(
        source="hi",
        target="en"
    ).translate(user_input)
else:
    translated_input = user_input.lower()

detected_symptoms = []

for hindi, english in hindi_symptoms.items():
    if hindi in user_input:
        detected_symptoms.append(english)

for phrase, mapped_symptom in symptom_alias.items():
    if phrase in translated_input:
        detected_symptoms.append(mapped_symptom)

formatted_columns = [symptom.replace("_", " ") for symptom in columns]

for original, formatted in zip(columns, formatted_columns):
    if formatted in translated_input:
        detected_symptoms.append(original)

detected_symptoms = list(set(detected_symptoms))

if len(detected_symptoms) < 2:
    message = "Please provide more symptoms for better prediction."

    if detected_language == "hi":
        message = GoogleTranslator(
            source="en",
            target="hi"
        ).translate(message)

    print(message)
    exit()

input_data = pd.DataFrame(
    np.zeros((1, len(columns))),
    columns=columns
)

for symptom in detected_symptoms:
    if symptom in columns:
        input_data.at[0, symptom] = 1

probabilities = model.predict_proba(input_data)[0]
diseases = model.classes_

top_indices = probabilities.argsort()[-5:][::-1]

top_diseases = [(diseases[i], probabilities[i]*100) for i in top_indices]


main_disease = top_diseases[0][0]
confidence = top_diseases[0][1]
similar_diseases = top_diseases[1:]

if confidence > 70:
    certainty = "High"
elif confidence > 40:
    certainty = "Moderate"
else:
    certainty = "Low"

response = f"""
Detected Symptoms: {detected_symptoms}

Predicted Disease: {main_disease}
Confidence: {round(confidence,2)} %
Certainty Level: {certainty}

Precautions:
{', '.join(precautions.get(main_disease, ["Consult doctor"]))}

Other Possible Diseases:
{', '.join([d[0] for d in similar_diseases])}
"""

if detected_language == "hi":
    response = GoogleTranslator(
        source="en",
        target="hi"
    ).translate(response)


print(response)