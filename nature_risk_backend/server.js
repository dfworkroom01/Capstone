const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3001;

// Middleware to parse JSON bodies
app.use(express.json());

// Endpoint to handle the POST request from the frontend and forward it to Flask API
app.post('/api/predict', async (req, res) => {
    try {
        // Get water_level, rainfall, temperature from the frontend request body
        const { water_level, rainfall, temperature } = req.body;

        // Send a POST request to the Flask API with the data
        const response = await axios.post('http://127.0.0.1:5001/predict', {
            water_level,
            rainfall,
            temperature
        });

        // Return the Flask prediction result to the frontend
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error making prediction with Flask API');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

