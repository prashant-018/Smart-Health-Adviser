"""
General supportive self-care hints only. Not medical advice; user must see a clinician for diagnosis.
Keys must match Training.csv `prognosis` / model.classes_ strings exactly.
"""

home_remedies = {
    "Fungal infection": [
        "Keep the area clean and dry; change socks/undergarments daily",
        "Avoid sharing towels; wash clothes in hot water when possible",
        "Use loose breathable cotton clothing",
    ],
    "Allergy": [
        "Avoid known triggers (dust, pollen, certain foods) when possible",
        "Use a clean damp cloth for nasal comfort; stay hydrated",
        "Keep windows closed on high-pollen days if that triggers you",
    ],
    "GERD": [
        "Try smaller meals; avoid lying down for 2–3 hours after eating",
        "Limit spicy, fried, and very acidic foods temporarily",
        "Raise the head of the bed slightly if night reflux bothers you",
    ],
    "Chronic cholestasis": [
        "Stay hydrated; avoid alcohol until a doctor advises",
        "Eat lighter meals; avoid very fatty foods",
        "Seek prompt medical follow-up—home steps only support comfort",
    ],
    "Drug Reaction": [
        "Do not self-adjust prescription medicines—contact your prescriber",
        "Note what you took and when; avoid that product until cleared",
        "Cool compresses may soothe mild skin irritation (if no broken skin)",
    ],
    "Peptic ulcer diseae": [
        "Avoid NSAIDs like ibuprofen unless a doctor approved them",
        "Smaller, bland meals; limit alcohol and smoking",
        "Stress reduction and regular sleep can help while you seek care",
    ],
    "AIDS": [
        "Rest, balanced nutrition, and hydration support overall health",
        "Never skip prescribed antiretroviral therapy—coordinate with your clinic",
        "Avoid raw/undercooked foods; practice infection precautions",
    ],
    "Diabetes ": [
        "Follow the meal pattern your doctor or dietitian gave you",
        "Stay active with walking if your clinician says it is safe",
        "Monitor only as directed; do not change insulin/oral drugs on your own",
    ],
    "Gastroenteritis": [
        "Sip oral rehydration or water frequently; small sips if vomiting",
        "Bland foods (rice, toast, banana) as tolerated after fluids stabilize",
        "Rest; avoid dairy and heavy greasy food for a day or two",
    ],
    "Bronchial Asthma": [
        "Sit upright; use prescribed inhaler exactly as your action plan says",
        "Avoid smoke, strong sprays, and cold dry air when it triggers you",
        "Steam from a warm shower may ease congestion for some (not a cure)",
    ],
    "Hypertension ": [
        "Reduce added salt; choose home-cooked meals when possible",
        "Walk daily if approved; maintain regular sleep",
        "Do not stop BP medicines without your doctor",
    ],
    "Migraine": [
        "Rest in a dark, quiet room; hydrate",
        "Cold pack on forehead or neck for some people",
        "Keep a simple symptom diary to share with your doctor",
    ],
    "Cervical spondylosis": [
        "Gentle neck stretches only if they do not increase pain",
        "Supportive pillow; avoid long periods looking down at phone",
        "Warm shower or heat pad on tight muscles (short sessions)",
    ],
    "Paralysis (brain hemorrhage)": [
        "This is an emergency pattern—call emergency services immediately",
        "Do not give food or drink if alertness is reduced",
        "Stay with the person and note time symptoms began",
    ],
    "Jaundice": [
        "Rest and plenty of fluids while you arrange medical evaluation",
        "Avoid alcohol and unnecessary painkillers until a doctor advises",
        "Light, easy-to-digest meals",
    ],
    "Malaria": [
        "Seek urgent medical testing and treatment—mosquito-borne illness needs care",
        "Rest and fluids while arranging care",
        "Use bed nets / repellents to protect others if advised locally",
    ],
    "Chicken pox": [
        "Cool baths or calamine lotion may ease itching (avoid scratching)",
        "Loose cotton clothes; trim nails to reduce skin infection risk",
        "Rest and fluids; stay home to reduce spread until a doctor clears you",
    ],
    "Dengue": [
        "Seek medical care for fever with severe pain or bleeding signs",
        "Oral rehydration and rest; avoid NSAIDs unless a doctor approves",
        "Monitor for worsening—follow local dengue guidance",
    ],
    "Typhoid": [
        "Needs antibiotics and medical care—hydration and rest until seen",
        "Boiled/filtered water; simple cooked foods",
        "Avoid preparing food for others until treated",
    ],
    "hepatitis A": [
        "Rest, hydration, and light meals; avoid alcohol completely",
        "Strict hand hygiene; avoid preparing food for others while ill",
        "Medical follow-up for monitoring",
    ],
    "Hepatitis B": [
        "No alcohol; balanced diet and rest as your specialist advises",
        "Never share needles, razors, or personal care items",
        "Long-term care is medical—follow your hepatology plan",
    ],
    "Hepatitis C": [
        "Avoid alcohol; nutrition and rest support liver health",
        "Treatment is prescription-based—stay in specialist follow-up",
        "Do not share items that may contact blood",
    ],
    "Hepatitis D": [
        "Specialist-managed condition—follow prescribed therapy",
        "Avoid alcohol; balanced meals and hydration",
    ],
    "Hepatitis E": [
        "Rest, fluids, light diet; avoid alcohol",
        "Hand hygiene and safe water; pregnant patients need urgent care",
    ],
    "Alcoholic hepatitis": [
        "Stop alcohol completely; seek addiction and liver care support",
        "Nutritious meals as tolerated; hydration",
        "Medical supervision is essential",
    ],
    "Tuberculosis": [
        "Complete the full antibiotic course from your TB program—do not stop early",
        "Nutrition, rest, and ventilation at home as advised",
        "Mask/cover cough if instructed until non-infectious",
    ],
    "Common Cold": [
        "Warm fluids, honey in warm water for adults (not for infants under 1)",
        "Saline gargles and steam inhalation for comfort",
        "Rest and sleep; humidified air can ease congestion",
    ],
    "Pneumonia": [
        "Medical evaluation is important—rest and fluids while arranging care",
        "Sit slightly propped up if breathing feels easier",
        "Complete antibiotics if prescribed; return if breathing worsens",
    ],
    "Dimorphic hemmorhoids(piles)": [
        "High-fiber foods and water; avoid straining on the toilet",
        "Warm sitz baths 10–15 minutes can soothe",
        "Avoid long sitting; gentle walking helps circulation",
    ],
    "Heart attack": [
        "Call emergency services immediately—chew aspirin only if previously told to",
        "Stop activity; sit or semi-recline while waiting for help",
        "Do not drive yourself to hospital",
    ],
    "Varicose veins": [
        "Elevate legs when resting; avoid standing still for very long periods",
        "Regular walking; compression stockings if a clinician recommended them",
        "Maintain healthy weight when possible",
    ],
    "Hypothyroidism": [
        "Take thyroid medicine exactly as prescribed on an empty stomach if directed",
        "Regular follow-up labs—do not change dose alone",
        "Balanced diet; fiber if constipation is an issue (with fluids)",
    ],
    "Hyperthyroidism": [
        "Avoid excess caffeine; rest and stress reduction",
        "Follow endocrinology plan; do not skip antithyroid drugs",
        "Stay hydrated",
    ],
    "Hypoglycemia": [
        "If conscious and it is your known pattern, use fast carbs as your plan says",
        "Recheck glucose; have a follow-up snack with protein if advised",
        "Seek help for confusion, seizures, or unconsciousness",
    ],
    "Osteoarthristis": [
        "Low-impact exercise (walking, swimming) if your clinician agrees",
        "Heat before activity, ice after flares for comfort",
        "Weight management reduces joint load",
    ],
    "Arthritis": [
        "Gentle range-of-motion; avoid overusing painful joints",
        "Warm compresses for stiffness; pacing activities",
        "Anti-inflammatory diet may help some people alongside medical care",
    ],
    "(vertigo) Paroymsal  Positional Vertigo": [
        "Move slowly; sit before standing; avoid sudden head turns",
        "Hydration; limit alcohol if it triggers episodes",
        "Vestibular maneuvers should be taught by a clinician—ask for guidance",
    ],
    "Acne": [
        "Gentle cleanser twice daily; avoid harsh scrubbing",
        "Non-comedogenic moisturizer and sunscreen",
        "Do not pick lesions; change pillowcases regularly",
    ],
    "Urinary tract infection": [
        "Drink water as tolerated; complete antibiotics if prescribed",
        "Avoid holding urine for long periods",
        "Seek care for fever, back pain, or blood in urine",
    ],
    "Psoriasis": [
        "Daily moisturizer after short lukewarm showers",
        "Manage stress; gentle sun exposure only as your dermatologist allows",
        "Avoid skin injury and harsh soaps",
    ],
    "Impetigo": [
        "Keep lesions clean; wash hands often; do not share towels",
        "Cover sores; often needs prescription antibiotics—see a clinician",
        "Trim nails to reduce scratching spread",
    ],
}

DEFAULT_HOME_REMEDIES = [
    "Rest and drink plenty of water unless your doctor restricted fluids",
    "Track symptoms and seek professional evaluation for persistent or worsening signs",
    "Avoid self-medicating with multiple over-the-counter drugs without advice",
]


def get_home_remedies_for_disease(disease_name):
    lines = home_remedies.get(disease_name)
    if not lines:
        return list(DEFAULT_HOME_REMEDIES)
    return lines
