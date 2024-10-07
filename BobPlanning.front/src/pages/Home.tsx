import React from 'react';
import TopBar from '../components/TopBar';
import NbGroupesPromo from '../components/NbGroupesPromo';
import DebFinCalendrier from '../components/DebFinCalendrier';

const Home: React.FC = () => {
    return (
        <div>
            <TopBar />
            <DebFinCalendrier />
            <NbGroupesPromo />


        </div>
    );
};

export default Home;