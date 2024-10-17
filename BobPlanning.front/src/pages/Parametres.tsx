import React, { useEffect } from 'react';
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
          "Periode": [{ dateDebutP: "", dateFinP: "" }]
        },
        {
          "Name": "ADI2",
          "Nombre": 0,
          "Periode": [{ dateDebutP: "", dateFinP: "" }]
        },
        {
          "Name": "CIR1",
          "Nombre": 0,
          "Periode": [{ dateDebutP: "", dateFinP: "" }]
        }
        ,
        {
          "Name": "CIR2",
          "Nombre": 0,
          "Periode": [{ dateDebutP: "", dateFinP: "" }]
        },
        {
          "Name": "AP3",
          "Nombre": 0,
          "Periode": [{ dateDebutP: "", dateFinP: "", nbSemaineP: 4 },
          { dateDebutP: "", dateFinP: "", nbSemaineP: 4 },
          { dateDebutP: "", dateFinP: "", nbSemaineP: 4 },
          { dateDebutP: "", dateFinP: "", nbSemaineP: 4 },
          { dateDebutP: "", dateFinP: "", nbSemaineP: 4 }
          ]
        },
        {
          "Name": "AP4",
          "Nombre": 0,
          "Periode": [{ dateDebutP: "", dateFinP: "", nbSemaineP: 8 },
          { dateDebutP: "", dateFinP: "", nbSemaineP: 8 },
          { dateDebutP: "", dateFinP: "", nbSemaineP: 8 },
          { dateDebutP: "", dateFinP: "", nbSemaineP: 8 }
          ]

        },
        {
          "Name": "AP5",
          "Nombre": 0,
          "Periode": [{ dateDebutP: "", dateFinP: "", nbSemaineP: 10 },
          { dateDebutP: "", dateFinP: "", nbSemaineP: 10 }
          ]
        }
        // ,
        // {
        //   "Name": "ISEN3",
        //   "Nombre": 0,
        //   "Periode": [{ dateDebutP: "", dateFinP: "" }]
        // },
        // {
        //   "Name": "ISEN4",
        //   "Nombre": 0,
        //   "Periode": [{ dateDebutP: "", dateFinP: "" }]
        // },
        // {
        //   "Name": "ISEN5",
        //   "Nombre": 0,
        //   "Periode": [{ dateDebutP: "", dateFinP: "" }]
        // }
      ]
  });


  const [isButtonDisabled, setIsButtonDisabled] = React.useState(true);

  const isAllDataFilled = () => {
    const { DateDeb, DateFin, Promos } = promosData;

    if (!DateDeb || !DateFin) {
      return false;
    }

    for (const promo of Promos) {
      if (promo.Nombre > 0) {
        for (const periode of promo.Periode) {
          if (!periode.dateDebutP || !periode.dateFinP || promo.Nombre === 0) {
            return false;
          }
        }
      }
    }
    return true;
  }

  useEffect(() => {
    setIsButtonDisabled(!isAllDataFilled());
  }, [promosData]);
  const handleSubmit = async () => {
    try {
      // Log des données envoyées
      console.log('Données envoyées :', JSON.stringify(promosData, null, 2));

      const response = await fetch('http://localhost:3000/generateEdtMacro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promosData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit Excel file');
      }

      const data = await response.json();
      console.log('Réponse du serveur :', data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <TopBar />
      <DebFinCalendrier promosData={promosData} setPromosData={setPromosData} />
      <FullWidthTabs promosData={promosData} setPromosData={setPromosData} />
      <button onClick={handleSubmit} disabled= {isButtonDisabled} >Valider</button>
    </div>
  );
};

export default Parametres;