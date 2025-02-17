import React, { useState } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import './Connexion.css';
import { getTokenFromLocalStorage } from '../auth/Token';

const Connexion: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const hashPassword = (password: string) => {
    return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
  };

  const handleLogin = async () => {
    const hashedPassword = hashPassword(password);

    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "x-access-token": getTokenFromLocalStorage() ?? "",
        },
        body: JSON.stringify({
          email: email,
          password: hashedPassword,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.token);
        console.log('Token : ', localStorage.getItem('accessToken'));
        navigate('/TrueHome');
      } else {
        const errorData = await response.json();

        if (errorData.message === 'Votre compte est bloqué. Veuillez contacter l\'administrateur.') {
          setError(errorData.message);
        } else {
          setError(errorData.message);
        }
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError('Une erreur s\'est produite lors de la connexion');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <Typography variant="h4">Connexion à Bob Planning</Typography>
        <TextField
          label="Adresse Email"
          variant="outlined"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          className="login-input"
        />
        <TextField
          label="Mot de Passe"
          variant="outlined"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          className="login-input"
        />
        <Button
          variant="contained"
          fullWidth
          onClick={handleLogin}
          className="login-button"
        >
          Se Connecter
        </Button>
        {error && <Typography color="error" style={{ marginTop: 16 }}>{error}</Typography>}
      </div>
    </div>
  );
};

export default Connexion;
