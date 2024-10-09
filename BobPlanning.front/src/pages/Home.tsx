import React from 'react';
import TopBar from '../components/TopBar';
import DebFinCalendrier from '../components/DebFinCalendrier';
import FullWidthTabs from '../components/TabsPromos';

const Home: React.FC = () => {
    return (
        <div>
            <TopBar />
            <DebFinCalendrier />
            <FullWidthTabs />
        </div>
    );
};

export default Home;