import React, { useState, FormEvent } from 'react';
import '../styles/pages/login/login-page.css';
import { useNavigate } from 'react-router-dom';

import logoFull from '../assets/logo/logo-full.png';
import ThemeToggle from '../components/ThemeToggle';
import { LoginCredentials } from '../services/base/types';
import { authService } from '../services/base/AuthService';

export default function Login(): React.ReactElement {

    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const navigate = useNavigate();
    const [hasError, setHasError] = useState(false);

     const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (username && password) {
            const loginData: LoginCredentials = {email: username, password}
            try {
               const result = await authService.login(loginData);
               if (result.success) {
                console.log('Connexion réussie');
                // Token is now stored in HTTP-only cookie by backend
                // Navigate to main page after successful login
                navigate('/planning');
               } else {
                console.log("Échec de connexion", result.response?.error);
                setHasError(true);
               }
            } catch (error) {
                console.log("Erreur de connexion:", error);
                setHasError(true);
            }

        } else {
            console.log("Veuillez entrer un nom d'utilisateur et un mot de passe");
        }
    };


    return (
        <div className="login-container">

            {/* Toggle thème spécifique à la page login */}
            <div className="login-theme-toggle">
                <ThemeToggle />
            </div>

            <div className="login-logo">
                <p>OPALE LOGIN</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
                <div className="input-group">
                    <label htmlFor="username">Nom d&apos;utilisateur</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="password">Mot de passe</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="login-btn">
                    Se connecter
                </button>
                {hasError && <span className="error-message">Login ou mot de passe non reconnu</span>}
            </form>
        </div>
    );
}
