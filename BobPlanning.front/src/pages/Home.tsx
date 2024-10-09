import React from 'react';
import TopBar from '../components/TopBar';
import DebFinCalendrier from '../components/DebFinCalendrier';
import FullWidthTabs from '../components/TabsPromos';
import PeriodesAP from '../components/PeriodesAP';
import ADI1 from '../components/ADI1';

const Home: React.FC = () => {
    return (
        <div>
            <TopBar />
            <DebFinCalendrier />
            <FullWidthTabs />
        
            <PeriodesAP />
            <ADI1 />
            <PeriodesAP nbPeriodesDefaultValue={2} />


        </div>
    );
};

export default Home;