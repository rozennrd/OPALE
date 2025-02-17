import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import './App.css';
import Layout from './components/Layout';

// Fonction pour vérifier si le token est expiré
const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true; // Considérer expiré si pas de token

  try {
    const payload = JSON.parse(atob(token.split('.')[1])); // Décoder le token
    const expiration = payload.exp * 1000; // Convertir en millisecondes
    return Date.now() > expiration; // Vérifier l'expiration
  } catch (e) {
    console.error('Erreur lors de la vérification du token:', e);
    return true; // Si erreur, on considère expiré
  }
};

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('accessToken');

      if (!token || isTokenExpired(token)) {
        console.log('Token expiré, déconnexion...');
        localStorage.removeItem('accessToken'); // Supprimer le token
        navigate('/login'); // Rediriger vers login
      }
    };

    checkToken(); // Vérification immédiate au chargement

    // Vérification toutes les 10 secondes
    const interval = setInterval(checkToken, 60000);

    return () => clearInterval(interval); // Nettoyage à la destruction du composant
  }, [navigate]);

  console.log('.env : ', import.meta.env.VITE_RACINE_FETCHER_URL);

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export default App;
