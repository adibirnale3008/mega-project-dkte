import os
import joblib
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

PORT = int(os.getenv("PORT", 5001))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Global variables for model and vectorizer
MODEL = None
VECTORIZER = None

def load_ml_resources():
    """Load the machine learning model and vectorizer once at startup."""
    global MODEL, VECTORIZER
    model_path = os.path.join(BASE_DIR, 'models', 'model.pkl')
    vectorizer_path = os.path.join(BASE_DIR, 'models', 'vectorizer.pkl')
    
    try:
        if os.path.exists(model_path) and os.path.exists(vectorizer_path):
            MODEL = joblib.load(model_path)
            VECTORIZER = joblib.load(vectorizer_path)
            print("Successfully loaded ML model and vectorizer.")
        else:
            print("Warning: Model or vectorizer not found. Please run train.py first.")
    except Exception as e:
        print(f"Error loading ML resources: {e}")

# Call immediately on startup
load_ml_resources()


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "success", 
        "message": "Python ML service is running",
        "model_loaded": MODEL is not None
    })

@app.route('/predict', methods=['POST'])
def predict():
    """
    Endpoint: POST /predict
    Input JSON: { "text": "This is a news headline" }
    Output JSON: { "prediction": "Fake/Real", "confidence": 0.85 }
    """
    if MODEL is None or VECTORIZER is None:
        return jsonify({"error": "ML model is not loaded on the server."}), 500

    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({"error": "Please provide 'text' in JSON body."}), 400

    news_text = data['text']
    if not isinstance(news_text, str) or not news_text.strip():
        return jsonify({"error": "Valid text is required."}), 400

    try:
        # Preprocess text (same as training)
        # 1. Transform text using the loaded TF-IDF vectorizer
        text_vectorized = VECTORIZER.transform([news_text])
        
        # 2. Predict the label (Fake or Real)
        prediction = MODEL.predict(text_vectorized)[0]
        
        # 3. Get the confidence score (probability of the predicted class)
        probabilities = MODEL.predict_proba(text_vectorized)[0]
        confidence = max(probabilities)
        
        return jsonify({
            "prediction": prediction,
            "confidence": round(float(confidence), 4)
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT, debug=False)

