import React from 'react';
import TabPromosMicro from '../components/TabsPromosMicro';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './ParametresMicro.css';
import Bouton from '../components/Bouton';
const ParametresMicro: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { promosData } = location.state || {}; // Destructure the state object to get the promosData
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
                    variant='contained'
                    disabled={true}
                >
                    Générer Micro
                </Bouton>
            </div>
        </div>
    );
};

export default ParametresMicro;