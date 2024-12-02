import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Box, Container, Paper, Typography, CircularProgress, Button } from '@mui/material';  // MUI components
import Signup from './components/Signup';
import Login from './components/Login';
import Verify2FA from './components/Verify2FA';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignedUp, setIsSignedUp] = useState(false);  // Default to false, login first
  const [totpSecret, setTotpSecret] = useState(null);  // Store TOTP secret
  const [token, setToken] = useState(localStorage.getItem('token'));  // JWT token from localStorage
  const [error, setError] = useState(null); // Error handling state
  const [loading, setLoading] = useState(false); // Loading state for async actions
  
  useEffect(() => {
    console.log('App loaded, current token:', token); // Debugging the token value
    // Check if user is already logged in and has a valid token
    if (token) {
      fetchTotpSecret();  // Fetch TOTP secret if token exists
    }
  }, [token]);

  const handleLoginSuccess = (token) => {
    console.log('Login successful, received token:', token); // Debugging
    setToken(token);  // Store the token in the state
    localStorage.setItem('token', token);  // Store the token in localStorage
    setIsLoggedIn(true);
    fetchTotpSecret();  // Fetch the TOTP secret once the user is logged in
  };

  const handleSignupSuccess = () => {
    setIsSignedUp(true);
  };

  const fetchTotpSecret = async () => {
    setLoading(true); // Set loading state while fetching
    try {
      console.log('Fetching TOTP secret with token:', token); // Debugging
      const response = await axios.get('http://127.0.0.1:5000/get_totp_secret', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('TOTP secret fetched:', response.data.totp_secret); // Debugging
      if (response.data.totp_secret) {
        setTotpSecret(response.data.totp_secret);
        setError(null); // Clear any previous errors
      } else {
        setError('TOTP secret not found.');
      }
    } catch (error) {
      console.error('Failed to fetch TOTP secret:', error);
      if (error.response && error.response.status === 401) {
        // If token expired or invalid, log out the user
        localStorage.removeItem('token');
        setToken(null);
        setIsLoggedIn(false);
        setError('Session expired, please log in again.');
      } else {
        setError(error.response ? error.response.data.message : 'Failed to fetch TOTP secret. Please try again.');
      }
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  const handleLogout = () => {
    // Log out the user
    localStorage.removeItem('token');
    setToken(null);
    setIsLoggedIn(false);
  };

  const handle2FAVerificationSuccess = () => {
    console.log("2FA verification successful, redirecting...");  // Debugging log
    window.location.href = "http://localhost:5174/predict"; 
  };

  return (
    <Container maxWidth="sm">
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" flexDirection="column">
        <Paper elevation={3} sx={{ padding: 3, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Welcome 
          </Typography>

          {error && <Typography color="error">{error}</Typography>} 

          {/* Loading spinner */}
          {loading && <CircularProgress />}

          {/* If the user is not logged in and hasn't signed up, show the login page */}
          {!isSignedUp && !isLoggedIn && (
            <Login onLoginSuccess={handleLoginSuccess} />
          )}

          {/* If the user is signed up but not logged in, show the signup page */}
          {isSignedUp && !isLoggedIn && (
            <Signup onSignupSuccess={handleSignupSuccess} />
          )}

          {/* If logged in and TOTP secret is available, show the TOTP secret */}
          {isLoggedIn && totpSecret && (
            <Box mt={3}>
              <Typography variant="h6" gutterBottom>
                Enter this secret in your 2FA app:
              </Typography>
              <Typography variant="body1">
                {totpSecret}
              </Typography>
            </Box>
          )}

          {/* If user is logged in and has a TOTP secret, show the 2FA verification page */}
          {isLoggedIn && totpSecret && (
            <Verify2FA token={token} on2FAVerificationSuccess={handle2FAVerificationSuccess} />
          )}

          {/* Debugging fallback */}
          {!isSignedUp && !isLoggedIn && <Typography variant="body1">Not signed up or logged in yet.</Typography>}
          {isLoggedIn && !totpSecret && <Typography variant="body1">Waiting for TOTP secret...</Typography>}

          {/* Add a link to navigate between login and signup */}
          {!isLoggedIn && (
            <Box mt={2}>
              <Button variant="outlined" color="primary" onClick={() => setIsSignedUp(!isSignedUp)}>
                {isSignedUp ? "Already have an account? Login" : "New user? Sign up"}
              </Button>
            </Box>
          )}

          {/* Logout button */}
          {isLoggedIn && (
            <Box mt={2}>
              <Button variant="outlined" color="secondary" onClick={handleLogout}>
                Logout
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default App;
