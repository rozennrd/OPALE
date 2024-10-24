import React, { useEffect, useState } from 'react';
import { Button, Box, Typography, Grid } from '@mui/material';
import TopBar from '../components/TopBar';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti'; // Importation de Confetti
import './Home.css';
import damienImage from '../assets/damien-ponassie.jpg'; // Image de Damien Ponassie

const Home: React.FC = () => {
    const [showFireworks, setShowFireworks] = useState(true);
    const [showConfetti, setShowConfetti] = useState(true); // État pour les confettis
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

    useEffect(() => {
        // Mettre à jour la taille de la fenêtre pour que les confettis couvrent toute la page
        const handleResize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };

        window.addEventListener('resize', handleResize);

        // Timer pour les confettis et les feux d'artifice
        const timer = setTimeout(() => {
            setShowFireworks(false); // Masquer les feux d'artifice après 3 secondes
            setShowConfetti(false); // Masquer les confettis après 10 secondes
        }, 20000); // Confettis visibles pendant 10 secondes

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }} // Animation d'apparition
            animate={{ opacity: 1, scale: [1, 1.05, 0.95, 1] }} // Effet de zoom oscillant
            transition={{ duration: 0.5, loop: Infinity }} // L'animation fait des boucles infinies
        >
            {/* TopBar component */}
            <TopBar />

            {/* Feux d'artifice */}
            {showFireworks && (
                <div>
                    <div className="fireworks"></div>
                    <div className="fireworks"></div>
                    <div className="fireworks"></div>
                    <div className="fireworks"></div>
                    <div className="fireworks"></div>
                </div>
            )}

            {/* Confettis */}
            {showConfetti && (
                <Confetti
                    width={windowSize.width} // La largeur de la fenêtre
                    height={windowSize.height} // La hauteur de la fenêtre
                    recycle={false} // Confettis non recyclables
                    numberOfPieces={1000} // Nombre de confettis pour un effet plus dense
                    gravity={0.1} // Gravité pour que les confettis tombent plus lentement
                />
            )}

            {/* Main content of the home page */}
            <Box className="home-container">
                {/* Header with logo */}
                <Box className="home-header">
                    <motion.div
                        animate={{ rotate: 360 }} // Rotation infinie
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    >
                        <Typography variant="h1" component="h1" className="home-title">
                            Bob Planning
                        </Typography>
                    </motion.div>
                </Box>

                {/* Welcome Section */}
                <motion.div
                    initial={{ x: '-100vw' }}
                    animate={{ x: 0 }}
                    transition={{ type: 'spring', stiffness: 50 }}
                >
                    <Typography variant="h2" component="h2" gutterBottom className="home-welcome">
                        Bienvenue sur l'outil ultime de gestion de planning
                    </Typography>
                    <Typography variant="body1" className="home-description">
                        Conçu spécialement pour <strong>Damien Ponassie</strong>, Président de la République du Nerdek et grand maître des plannings.
                        Simplifiez la gestion de vos horaires avec une précision à la minute près.
                    </Typography>
                </motion.div>

                {/* Damien Ponassie section */}

                <Box className="damien-section">
                    <motion.div
                        whileHover={{ scale: 1.2, rotate: 10 }} // Animation quand on survole l'image
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <img src={damienImage} alt="Damien Ponassie" className="damien-image" />

                    </motion.div>
                    <Typography variant="h3" className="damien-title">
                        Damien Ponassie
                    </Typography>
                    <Typography variant="body2" className="damien-description">
                        Le génie derrière l'organisation. Son expertise et sa vision ont façonné Bob Planning pour devenir la solution idéale pour tous les maîtres des plannings.
                    </Typography>
                </Box>

                {/* Action Buttons Section */}
                <Grid container spacing={2} className="home-actions">
                    <Grid item xs={12} sm={6}>
                        <motion.div
                            whileHover={{ scale: 1.2, boxShadow: "0px 0px 10px rgb(0,0,255)" }}
                            transition={{ duration: 0.3 }}
                        >
                            <Button variant="contained" color="primary" fullWidth href="/schedule">
                                Voir le Planning
                            </Button>
                        </motion.div>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <motion.div
                            whileHover={{ scale: 1.2, boxShadow: "0px 0px 10px rgb(255,0,0)" }}
                            transition={{ duration: 0.3 }}
                        >
                            <Button variant="outlined" color="secondary" fullWidth href="/settings">
                                Paramètres
                            </Button>
                        </motion.div>
                    </Grid>
                </Grid>
            </Box>
        </motion.div>
    );
};

export default Home;
