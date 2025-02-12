import React, { useState } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Pour la redirection
import CryptoJS from 'crypto-js'; // Pour le hachage du mot de passe
import './Connexion.css'; // Style de la page
import { getTokenFromLocalStorage } from '../auth/Token';

const Connexion: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [numTryConnection, setNumTryConnection] = useState(0); // Nombre de tentatives
  const navigate = useNavigate(); // Utilisation de navigate pour rediriger

  // Fonction pour hacher le mot de passe
  const hashPassword = (password: string) => {
    return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
  };

  // Fonction de connexion
  const handleLogin = async () => {
    const hashedPassword = hashPassword(password);

    try {
      // Requête HTTP POST vers l'API de connexion du backend
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
        const data = await response.json(); // Récupérer le token JWT renvoyé
        setNumTryConnection(0); // Réinitialise le nombre de tentatives après succès
        localStorage.setItem('accessToken', data.token);
        console.log('Token : ', localStorage.getItem('accessToken'));
        navigate('/TrueHome'); // Redirection vers la page d'accueil
      } else {
        const errorData = await response.json();
        
        // Si l'utilisateur est bloqué, afficher le message de blocage
        if (errorData.message === 'Votre compte est bloqué. Veuillez contacter l\'administrateur.') {
          setError(errorData.message); // Message spécifique de blocage
        } else {
          setNumTryConnection(prev => prev + 1); // Incrémente le nombre de tentatives
          setError(errorData.message); // Autres erreurs (par exemple, mot de passe incorrect)
        }
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
