import React, { useState, FormEvent } from 'react';
import '../styles/pages/login/login-page.css';
import { useNavigate } from 'react-router-dom';

import logoFull from '../assets/logo-full.png';
import ThemeToggle from '../components/ThemeToggle';

export default function Login(): Element {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const navigate = useNavigate();

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (username && password) {
            console.log('Connexion réussie');
            navigate('/planning');
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
                <img src={logoFull} alt="Logo OPALE" />
            </div>

            <form onSubmit={handleSubmit} className="login-form">
                <div className="input-group">
                    <label htmlFor="username">Nom d'utilisateur</label>
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
            </form>
        </div>
    );
}