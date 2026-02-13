import React from 'react';
import TabPromosMicro from '../components/TabsPromosMicro';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './ParametresMicro.css';
import Bouton from '../components/Bouton';
import Loading from '../components/Loading';
import { getTokenFromLocalStorage } from '../auth/Token';
import DownloadButton from '../components/DownloadButton';

const RACINE_FETCHER_URL = import.meta.env.VITE_RACINE_FETCHER_URL;

const ParametresMicro: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [message, setMessage] = React.useState<string | null>(null);
    const [fileUrl, setFileUrl] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const { promosData } = location.state || {}; // Destructure the state object to get the promosData
    
    
    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${RACINE_FETCHER_URL}/generateEdtMicro`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  "x-access-token": getTokenFromLocalStorage() ?? "",
                },
                body: JSON.stringify(promosData),
            });

            if (!response.ok) {
                throw new Error('Failed to submit Excel file');
            }

            const data = await response.json();
            setMessage('Le fichier a été généré avec succès !');
            setFileUrl(data.fileUrl);
        } catch (error) {
            console.error('Error fetching promos data:', error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="container">
            <TabPromosMicro promosData={promosData} />
            <div className="buttons-container">
                <Bouton
                    onClick={() => navigate('/parametres', { state: { promosData } })}
                    variant='contained'
                    className='secondary-button'
                >
                    ←  Paramètres Macro
                </Bouton>

                <Bouton
                    onClick={handleSubmit}
                    variant='contained'
                    disabled={false}
                >
                    Générer Micro
                </Bouton>
            </div>
            {isLoading &&
                <div className="loading-container">
                    <Loading />
                </div>
            }

            {message && <div className='message-success'>{message}</div>}
            {fileUrl && (
            <DownloadButton fileUrl={fileUrl} label="Télécharger le fichier" />
            )}
        </div>
    );
};

export default ParametresMicro;