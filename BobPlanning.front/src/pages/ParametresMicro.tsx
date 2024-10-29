import React from 'react';
import TopBar from '../components/TopBar';
import TabPromosMicro from '../components/TabsPromosMicro';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';

const ParametresMicro: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { promosData } = location.state || {}; // Destructure the state object to get the promosData
    return (
        <div>
            <TopBar />
            <TabPromosMicro promosData={promosData} />
            <Button
                variant="contained"
                //Redirects to the Macro page
                onClick={() => navigate('/parametres', { state: { promosData } })}

                sx={{
                    backgroundColor: '#242424',  // Couleur d'arrière-plan personnalisée
                    color: '#FFFFFF',            // Couleur du texte
                    '&:hover': {
                        backgroundColor: '#E64A19',  // Couleur lorsque l'on survole le bouton
                    },
                    mt: 3,
                }} >
                ←  Paramètres Macro
            </Button>

            <Button
                variant="contained"
              
                disabled= {true}
                sx={{
                    backgroundColor: '#242424',  // Couleur d'arrière-plan personnalisée
                    color: '#FFFFFF',            // Couleur du texte
                    '&:hover': {
                        backgroundColor: '#E64A19',  // Couleur lorsque l'on survole le bouton
                    },
                    mt: 3,
                }}
            >
                Générer Micro
            </Button>


        </div>
    );
};

export default ParametresMicro;