import React from 'react';
import TopBar from '../components/TopBar';
import DebFinCalendrier from '../components/DebFinCalendrier';
import FullWidthTabs from '../components/TabsPromos';

const Parametres: React.FC = () => {
const [promosData, setPromosData] = React.useState<any>({
    "DateDeb": "",
    "DateFin": "",
    "Promos": 
    [
          {
            "Name": "ADI1",
            "Nombre": 0,
            "Periodes": [{dateDebutP: "", dateFinP: ""}]
          },
          {
            "Name": "ADI2",
            "Nombre": 0,
            "Periodes": [{dateDebutP: "", dateFinP: ""}]
          },
          {
            "Name": "CIR1",
            "Nombre": 0,
            "Periodes": [{dateDebutP: "", dateFinP: ""}]
          },
          {
            "Name": "CIR2",
            "Nombre": 0,
            "Periodes": [{dateDebutP: "", dateFinP: ""}]
          },
          {
            "Name": "AP3",
            "Nombre": 0,
            "Periodes":[{dateDebutP: "", dateFinP: ""}]
          },
          {
            "Name": "AP4",
            "Nombre": 0,
            "Periodes":[{dateDebutP: "", dateFinP: ""}]
          },
          {
            "Name": "AP5",
            "Nombre": 0,
            "Periodes":[{dateDebutP: "", dateFinP: ""}]
          },
          {
            "Name": "ISEN1",
            "Nombre": 0,
            "Periodes":[{dateDebutP: "", dateFinP: ""}]
          },
          {
            "Name": "ISEN2",
            "Nombre": 0,
            "Periodes":[{dateDebutP: "", dateFinP: ""}]
          },
          {
            "Name": "ISEN3",
            "Nombre": 0,
            "Periodes":[{dateDebutP: "", dateFinP: ""}]
          }
    ]
  });

    return (
        <div>
            <TopBar />
            <DebFinCalendrier promosData={promosData} setPromosData={setPromosData} />
            <FullWidthTabs promosData={promosData} setPromosData={setPromosData}/>
        </div>
    );
};

export default Parametres;