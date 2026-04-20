from pathlib import Path

import joblib
from flask import Flask, request, jsonify

app = Flask(__name__)

BASE_DIR = Path(__file__).resolve().parent

# Load the vectorizer and model once when starting the app
vectorizer = joblib.load(BASE_DIR / 'vectorizer.pkl')
model = joblib.load(BASE_DIR / 'sentiment_model1.pkl')


@app.get('/health')
def health_check():
    return jsonify({'status': 'ok'})

@app.route('/predict', methods=['POST'])
def predict():
    payload = request.get_json(silent=True) or {}
    text = str(payload.get('text') or '').strip()

    if not text:
        q1 = str(payload.get('q1') or '').strip()
        q2 = str(payload.get('q2') or '').strip()
        q3 = str(payload.get('q3') or '').strip()
        other = str(payload.get('text') or payload.get('other') or '').strip()
        parts = []
        if q1:
            parts.append(f"Q1: {q1}")
        if q2:
            parts.append(f"Q2: {q2}")
        if q3:
            parts.append(f"Q3: {q3}")
        if other:
            parts.append(f"Other: {other}")
        text = " | ".join(parts).strip()

    if not text:
        return jsonify({'error': 'Feedback content is required'}), 400

    # Use transform, NOT fit_transform
    vectorized_data = vectorizer.transform([text])
    prediction = model.predict(vectorized_data)
    return jsonify({'prediction': str(prediction[0])})

if __name__ == '__main__':
    app.run(port=5001, debug= True)
    print("predicting......")
