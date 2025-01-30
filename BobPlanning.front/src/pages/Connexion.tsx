import React, { useState } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Pour la redirection
import CryptoJS from 'crypto-js'; // Pour le hachage du mot de passe
import truehome from './TrueHome'; // Page d'accueil après connexion
import './Connexion.css'; // Style de la page

const Connexion: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Utilisation de navigate pour rediriger

  // Fonction pour hacher le mot de passe
  const hashPassword = (password: string) => {
    // Hachage avec SHA-256 (attention : CryptoJS produit un hash hexadécimal)
    return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex); 
  };

  // Fonction de connexion (envoi de la requête POST avec le mot de passe haché)
  const handleLogin = async () => {
    // Affichage du mot de passe haché pour le debug
    console.log('Mot de passe haché:', hashPassword(password)); // debug

    // Hash le mot de passe avant de l'envoyer
    const hashedPassword = hashPassword(password);

    try {
      // Requête HTTP POST vers l'API de connexion du backend
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Indiquer que le corps de la requête est en JSON
        },
        body: JSON.stringify({
          email: email,
          password: hashedPassword, // Le mot de passe haché est envoyé
        }),
      });
      // Si la réponse du backend est OK (code 200)
      if (response.ok) {
        const data = await response.json(); // On récupère le token JWT renvoyé
        // Si la connexion réussie, on stocke le token dans le localStorage
        localStorage.setItem('authToken', data.token);
        // Ensuite, on redirige vers la page d'accueil ou une page protégée
        navigate('/TrueHome'); // Redirection vers la page 'home'
      } else {
        // Si la réponse du backend n'est pas OK, on récupère et affiche l'erreur
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
        margin="normal"
      />
      <TextField
        label="Mot de Passe"
        variant="outlined"
        type="password"
        fullWidth
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        margin="normal"
      />
      <Button variant="contained" fullWidth onClick={handleLogin} style={{ marginTop: 16 }}>
        Se Connecter
      </Button>
      {error && <Typography color="error" style={{ marginTop: 16 }}>{error}</Typography>}
    </div>
  );
};

export default Connexion;
