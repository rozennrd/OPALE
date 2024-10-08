import React from 'react';
import TopBar from '../components/TopBar';
import NbGroupesPromo from '../components/NbGroupesPromo';
import DebFinCalendrier from '../components/DebFinCalendrier';
import FullWidthTabs from '../components/TabsPromos';

const Home: React.FC = () => {
    return (
        <div>
            <TopBar />
            <DebFinCalendrier />
            <FullWidthTabs /> 
            <NbGroupesPromo />
            

        </div>
    );
};

export default Home;