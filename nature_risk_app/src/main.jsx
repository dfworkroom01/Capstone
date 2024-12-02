import React from 'react';
import ReactDOM from 'react-dom/client';  // Import from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App'; // App component for prediction and data display
import Home from './Home'; // Home component
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap styles

// Get the root element
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the app with the new API
root.render(
  <Router>
    <Routes>
      {/* This is the home route (default) */}
      <Route path="/" element={<Home />} />
      {/* This route leads to the prediction page (App.jsx) */}
      <Route path="/predict" element={<App />} />
    </Routes>
  </Router>
);





