import React, { useState } from 'react';
import axios from 'axios';
import { Button, TextField, Container, Box, Typography } from '@mui/material';

const Verify2FA = ({ on2FAVerificationSuccess }) => {  // Accept the callback function as a prop
  const [totpCode, setTotpCode] = useState('');
  const token = localStorage.getItem('token');  // JWT from login

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!totpCode) {
      alert('Please enter the TOTP code.');
      return;
    }

    // Debugging log to check the entered TOTP code format
    console.log('Entered TOTP Code:', totpCode);

    // Validate TOTP Code format (ensure it's 6 digits)
    if (!/^\d{6}$/.test(totpCode)) {
      alert('Invalid TOTP code format. Please enter a 6-digit code.');
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:5000/verify_2fa', {
        totp_code: totpCode  // Send the manually entered TOTP code
      }, {
        headers: {
          Authorization: `Bearer ${token}`  // Send the JWT token in the Authorization header
        }
      });

      // If the verification is successful, call the on2FAVerificationSuccess callback
      if (response.status === 200) {
        alert('2FA Verified Successfully!');
        on2FAVerificationSuccess();  // Trigger the redirection
      } else {
        alert(response.data.message);  // Display success or error message from backend
      }
    } catch (error) {
      alert('Invalid 2FA code');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <Typography variant="h5" gutterBottom>
          2FA Verification
        </Typography>
        <form onSubmit={handleVerify}>
          <TextField
            fullWidth
            label="Enter TOTP Code"
            variant="outlined"
            margin="normal"
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value)}  // Manually enter TOTP code
            required
          />
          <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 2 }}>
            Verify
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default Verify2FA;
