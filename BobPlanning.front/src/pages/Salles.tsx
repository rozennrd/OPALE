import React from 'react';
import SallesDisplay from '../components/SallesDisplay'; // Adjust the path as necessary
import AddSalle from '../components/AddSalle'; // Adjust the path as necessary
const Salles: React.FC = () => {
    return (
        <div>
            <div className="container">
                <SallesDisplay/>
            </div>
            <div className="container">
                <AddSalle />
            </div>
        </div>
    );
};

export default Salles;