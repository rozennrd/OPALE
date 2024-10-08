import React from 'react';
import TopBar from '../components/TopBar';
import NbGroupesPromo from '../components/NbGroupesPromo';
import DebFinCalendrier from '../components/DebFinCalendrier';
import FullWidthTabs from '../components/TabsPromos';
import PeriodesAP from '../components/PeriodesAP';

const Home: React.FC = () => {
    return (
        <div>
            <TopBar />
            <DebFinCalendrier />
            <FullWidthTabs /> 
            <NbGroupesPromo />
            
            <PeriodesAP />


        </div>
    );
};

export default Home;