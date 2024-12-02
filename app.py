import warnings
from flask import Flask, request, jsonify
from flask_cors import CORS 
import joblib
import numpy as np

warnings.filterwarnings("ignore", category=UserWarning, message="X does not have valid feature names")

app = Flask(__name__)
CORS(app)

# Load the pre-trained model (the 'drought_model.pkl' file)
model = joblib.load('drought_model.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get data from request
        data = request.get_json()

        # Extract features: water_level, rainfall, temperature
        features = np.array([[data['water_level'], data['rainfall'], data['temperature']]])

        # Make prediction using the model
        prediction = model.predict(features)
        
        # Return prediction
        return jsonify({'drought_risk': prediction[0]})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)  # Specify port 5001
    app.run(debug=True)
