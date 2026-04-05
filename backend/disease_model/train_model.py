import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import pickle

df = pd.read_csv("Training.csv")

if "Unnamed: 133" in df.columns:
    df = df.drop("Unnamed: 133", axis=1)

X = df.drop("prognosis", axis=1)
y = df["prognosis"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = RandomForestClassifier(
    n_estimators=500,
    max_depth=20,
    min_samples_split=5,
    random_state=42
)
model.fit(X_train, y_train)

pickle.dump(model, open("model.pkl", "wb"))

pickle.dump(X.columns.tolist(), open("symptom_columns.pkl", "wb"))

print("Model trained successfully")