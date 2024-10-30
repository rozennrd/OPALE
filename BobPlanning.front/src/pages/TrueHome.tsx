import './TrueHome.css';
import ReactPlayer from 'react-player';


const TrueHome = () => {
    return (
        <div className="home-container">
            {/* Section principale avec titre et description */}
            <section className="text-section">
                <div className="text-section">
                    <h1 className="first-text">
                        Conçu pour les utilisateurs. <span className="highlight">Optimisé pour la productivité.</span>
                    </h1>
                    <p className="second-text">
                        Vous pouvez essayer <span className="highlight">BOB Planning</span> gratuitement aussi longtemps que vous le souhaitez.
                    </p>
                </div>
            </section>
            <section className="tutos-section">
                <div className="tuto-container">
                    <div className="tuto-video">
                        <ReactPlayer
                            url='https://www.youtube.com/watch?v=uXlWYZ022zU'  // The relative path to the video in the public folder
                            playing={true}               // Autoplay video
                            loop={true}   
                        />

                    </div>
                    <div className="tuto-text">
                        <h2>Centralisez facilement vos plannings avec Bob Planning.</h2>
                        <p>
                            Créez des plannings macros qui intègrent toutes les promotions et les vacances scolaires,
                            pour simplifier la gestion et alléger les tâches administratives.
                        </p>
                        <a href="#details" className="learn-more-link">
                            En savoir plus sur la génération des macros.
                        </a>
                    </div>
                </div>

                <div className="tuto-container">
                    
                    <div className="tuto-text">
                        <h2>Optimisez votre productivité avec des outils intelligents.</h2>
                        <p>
                            Apprenez comment utiliser les fonctionnalités avancées pour automatiser la planification et gérer vos tâches efficacement.
                        </p>
                        <a href="#details" className="learn-more-link">
                            Découvrir les fonctionnalités avancées.
                        </a>
                    </div>
                    <div className="tuto-video">
                        {/* Placez ici une balise <img> ou un composant vidéo */}
                        <ReactPlayer
                           url='https://www.youtube.com/watch?v=kQcq3rpne78'  // The relative path to the video in the public folder
                           playing={true}               // Autoplay video
                           loop={true}   
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default TrueHome;