// server.test.js

const request = require('supertest');
const axios = require('axios');
const axiosMockAdapter = require('axios-mock-adapter');
const app = require('./server'); // Import the Express app from server.js

// Create a mock instance of axios
const mock = new axiosMockAdapter(axios);

describe('POST /api/predict', () => {
  // Reset the mock before each test
  beforeEach(() => {
    mock.reset();
  });

  // Restore the mock after each test to ensure proper cleanup
  afterEach(() => {
    mock.restore(); // Explicitly restore axios mock adapter
  });

  test('should return prediction from Flask API', async () => {
    // Mock the response from Flask API
    mock.onPost('http://127.0.0.1:5001/predict').reply(200, {
      prediction: 'Predicted Value',
    });

    const requestBody = {
      water_level: 10,
      rainfall: 20,
      temperature: 30,
    };

    const response = await request(app)
      .post('/api/predict')
      .send(requestBody)
      .expect('Content-Type', /json/)  // Expect JSON response
      .expect(200);  // Expect HTTP 200

    expect(response.body).toEqual({
      prediction: 'Predicted Value',
    });
  });

  test('should return error when Flask API request fails', async () => {
    // Mock Flask API failure response
    mock.onPost('http://127.0.0.1:5001/predict').reply(500);

    const requestBody = {
      water_level: 10,
      rainfall: 20,
      temperature: 30,
    };

    const response = await request(app)
      .post('/api/predict')
      .send(requestBody)
      .expect('Content-Type', /html/)  // Expect HTML response
      .expect(500);  // Expect HTTP 500

    // Check that the response contains the expected error message in HTML
    expect(response.text).toContain('Error making prediction with Flask API');
  });
});
