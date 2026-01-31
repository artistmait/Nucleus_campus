import joblib
from flask import Flask, request, jsonify

app = Flask(__name__)

# Load the vectorizer and model once when starting the app
vectorizer = joblib.load('tfidf_vectorizer.pkl')
model = joblib.load('sentiment_model.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json.get('text', '')
    # Use transform, NOT fit_transform
    vectorized_data = vectorizer.transform([data]) 
    prediction = model.predict(vectorized_data)
    return jsonify({'prediction': str(prediction[0])})

if __name__ == '__main__':
    app.run(port=5001, debug= True)
    print("predicting......")
