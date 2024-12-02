import unittest
import json
from app import app  # Import your Flask app

class TestDroughtPredictionApp(unittest.TestCase):
    
    # Set up the test client for Flask
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True
    
    # Test that the /predict endpoint works correctly with valid data
    def test_predict_valid_data(self):
        # Sample valid data
        data = {
            'water_level': 5.2,
            'rainfall': 100.3,
            'temperature': 30.1
        }

        # Make POST request to /predict
        response = self.app.post('/predict', 
                                 data=json.dumps(data), 
                                 content_type='application/json')

        # Check that the status code is 200 (OK)
        self.assertEqual(response.status_code, 200)

        # Check that the response contains the drought_risk key
        response_data = json.loads(response.data)
        self.assertIn('drought_risk', response_data)

    # Test that the /predict endpoint returns an error with invalid data
    def test_predict_invalid_data(self):
        # Sample invalid data (missing required fields)
        data = {
            'water_level': 5.2,
            'rainfall': 100.3
            # Missing temperature
        }

        # Make POST request to /predict
        response = self.app.post('/predict', 
                                 data=json.dumps(data), 
                                 content_type='application/json')

        # Check that the status code is 500 (Internal Server Error)
        self.assertEqual(response.status_code, 500)

        # Check that the response contains an error message
        response_data = json.loads(response.data)
        self.assertIn('error', response_data)

    # Test with empty input data
    def test_predict_empty_input(self):
        data = {}

        # Make POST request with empty data
        response = self.app.post('/predict', 
                                 data=json.dumps(data), 
                                 content_type='application/json')

        # Check that the status code is 500 (Internal Server Error)
        self.assertEqual(response.status_code, 500)

        # Check that the response contains an error message
        response_data = json.loads(response.data)
        self.assertIn('error', response_data)

    # Test with extreme values for water_level, rainfall, and temperature
    def test_predict_extreme_values(self):
        # Extreme values for all features
        extreme_data = {
            'water_level': 10000.0,  # Extremely high value for water_level
            'rainfall': 10000.0,     # Extremely high value for rainfall
            'temperature': -100.0    # Extremely low value for temperature
        }

        # Make POST request with extreme values
        response = self.app.post('/predict', 
                                 data=json.dumps(extreme_data), 
                                 content_type='application/json')

        # Check that the status code is 200 (OK)
        self.assertEqual(response.status_code, 200)

        # Check that the response contains the drought_risk key
        response_data = json.loads(response.data)
        self.assertIn('drought_risk', response_data)

    # Test with very low values for water_level, rainfall, and temperature
    def test_predict_very_low_values(self):
        # Very low values for all features
        low_data = {
            'water_level': 0.0,       # Very low value for water_level
            'rainfall': 0.0,          # Very low value for rainfall
            'temperature': -50.0      # Very low value for temperature
        }

        # Make POST request with very low values
        response = self.app.post('/predict', 
                                 data=json.dumps(low_data), 
                                 content_type='application/json')

        # Check that the status code is 200 (OK)
        self.assertEqual(response.status_code, 200)

        # Check that the response contains the drought_risk key
        response_data = json.loads(response.data)
        self.assertIn('drought_risk', response_data)

    # Test missing individual features in the input data
    def test_predict_missing_water_level(self):
        # Data with missing water_level
        missing_data = {
            'rainfall': 100.3,
            'temperature': 30.1
        }

        # Make POST request with missing water_level
        response = self.app.post('/predict', 
                                 data=json.dumps(missing_data), 
                                 content_type='application/json')

        # Check that the status code is 500 (Internal Server Error)
        self.assertEqual(response.status_code, 500)

        # Check that the response contains an error message
        response_data = json.loads(response.data)
        self.assertIn('error', response_data)

    def test_predict_missing_rainfall(self):
        # Data with missing rainfall
        missing_data = {
            'water_level': 5.2,
            'temperature': 30.1
        }

        # Make POST request with missing rainfall
        response = self.app.post('/predict', 
                                 data=json.dumps(missing_data), 
                                 content_type='application/json')

        # Check that the status code is 500 (Internal Server Error)
        self.assertEqual(response.status_code, 500)

        # Check that the response contains an error message
        response_data = json.loads(response.data)
        self.assertIn('error', response_data)

    def test_predict_missing_temperature(self):
        # Data with missing temperature
        missing_data = {
            'water_level': 5.2,
            'rainfall': 100.3
        }

        # Make POST request with missing temperature
        response = self.app.post('/predict', 
                                 data=json.dumps(missing_data), 
                                 content_type='application/json')

        # Check that the status code is 500 (Internal Server Error)
        self.assertEqual(response.status_code, 500)

        # Check that the response contains an error message
        response_data = json.loads(response.data)
        self.assertIn('error', response_data)

if __name__ == '__main__':
    unittest.main()
