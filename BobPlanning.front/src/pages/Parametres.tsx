import React from 'react';
import TopBar from '../components/TopBar';
import DebFinCalendrier from '../components/DebFinCalendrier';
import FullWidthTabs from '../components/TabsPromos';

const Parametres: React.FC = () => {
    return (
        <div>
            <TopBar />
            <DebFinCalendrier />
            <FullWidthTabs />
        </div>
    );
};

export default Parametres;