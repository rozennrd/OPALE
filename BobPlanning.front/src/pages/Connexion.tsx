import React, { useState } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Pour la redirection
import CryptoJS from 'crypto-js'; // Pour le hachage du mot de passe
import './Connexion.css'; // Style de la page

const Connexion: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Utilisation de navigate pour rediriger

  // Fonction pour hacher le mot de passe
  const hashPassword = (password: string) => {
    return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex); // Hachage avec SHA-256
    
  };

  // Fonction de connexion (envoi de la requête au backend)
  const handleLogin = async () => {
    console.log('Mot de passe haché:', hashPassword(password));//debug
    const hashedPassword = hashPassword(password);
    

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: hashedPassword,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Si la connexion réussie, on stocke le token dans le localStorage
        localStorage.setItem('authToken', data.token);
        // Ensuite, on redirige vers la page d'accueil ou une page protégée
        navigate('/home'); // Redirection vers la page home
      } else {
        const errorData = await response.json();
        setError(errorData.message); // Affichage du message d'erreur
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError('Une erreur s\'est produite lors de la connexion');
    }
  };

  return (
    <div className="login-container">
      <Typography variant="h4">Connexion à Bob Planning</Typography>
      <TextField
        label="Adresse Email"
        variant="outlined"
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="Mot de Passe"
        variant="outlined"
        type="password"
        fullWidth
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button variant="contained" fullWidth onClick={handleLogin}>
        Se Connecter
      </Button>
      {error && <Typography color="error">{error}</Typography>}
    </div>
  );
};

export default Connexion;
