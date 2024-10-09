import React from 'react';
import { Button, Box, Typography, Grid } from '@mui/material';
import TopBar from '../components/TopBar';
import './Home.css';
import damienImage from '../assets/damien-ponassie.jpg'; // Image de Damien Ponassie

const Home: React.FC = () => {
    return (
        <div>
            {/* TopBar component */}
            <TopBar />

            {/* Main content of the home page */}
            <Box className="home-container">
                {/* Header with logo */}
                <Box className="home-header">
                    <Typography variant="h1" component="h1" className="home-title">
                        Bob Planning
                    </Typography>
                </Box>

                {/* Welcome Section */}
                <Typography variant="h2" component="h2" gutterBottom className="home-welcome">
                    Bienvenue sur l'outil ultime de gestion de planning
                </Typography>
                <Typography variant="body1" className="home-description">
                    Conçu spécialement pour <strong>Damien Ponassie</strong>, Président de la République du Nerdek et grand maître des plannings.
                    Simplifiez la gestion de vos horaires avec une précision à la minute près.
                </Typography>

                {/* Damien Ponassie section */}
                <Box className="damien-section">
                    <img src={damienImage} alt="Damien Ponassie" className="damien-image" />
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
                        <Button variant="contained" color="primary" fullWidth href="/schedule">
                            Voir le Planning
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Button variant="outlined" color="secondary" fullWidth href="/settings">
                            Paramètres
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </div>
    );
};

export default Home;
