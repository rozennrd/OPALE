import React from 'react';
import TopBar from '../components/TopBar';
import NbGroupesPromo from '../components/NbGroupesPromo';
import DebFinCalendrier from '../components/DebFinCalendrier';
import PeriodesAP from '../components/PeriodesAP';

const Home: React.FC = () => {
    return (
        <div>
            <TopBar />
            <DebFinCalendrier />
            <NbGroupesPromo />
            <PeriodesAP />


        </div>
    );
};

export default Home;