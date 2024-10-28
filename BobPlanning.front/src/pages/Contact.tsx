import React from 'react';
import TopBar from '../components/TopBar';
import './Contact.css'; // Assurez-vous d'importer le fichier CSS

const Contact: React.FC = () => {
    return (
        <div className="contact-container">
            <TopBar />
            <h1>Contactez-nous</h1>
            <p>
                N'hésitez pas à nous contacter via l'un des moyens ci-dessous ou en remplissant le formulaire de contact.
            </p>

            <div className="contact-info">
                <div className="info-item">
                    <span>📞 +33 6 07 95 65 61</span>
                </div>
                <div className="info-item">
                    <span>✉️ Damien.ponassie@junia.com</span>
                </div>
                <div className="info-item">
                    <span>📍 2 Allée Marianne Loir, 33800 Bordeaux, France</span>
                </div>
            </div>

            <h2>Formulaire de Contact</h2>
            <form className="contact-form">
                <label htmlFor="name">Nom :</label>
                <input type="text" id="name" placeholder="Votre nom" />

                <label htmlFor="email">Email :</label>
                <input type="email" id="email" placeholder="Votre email" />

                <label htmlFor="message">Message :</label>
                <textarea id="message" placeholder="Votre message"></textarea>

                <button type="submit">Envoyer</button>
            </form>
        </div>
    );
};

export default Contact;