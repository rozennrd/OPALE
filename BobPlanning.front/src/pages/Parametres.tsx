import React, { useEffect, useRef } from 'react';
import TopBar from '../components/TopBar';
import DebFinCalendrier from '../components/DebFinCalendrier';
import FullWidthTabs from '../components/TabsPromos';
import Button from '@mui/material/Button';

const Parametres: React.FC = () => {
  const [promosData, setPromosData] = React.useState<any>({
    "DateDeb": "",
    "DateFin": "",
    "Promos":
      [
        {
          "Name": "ADI1",
          "Nombre": 0,
          "Periode": [{ "DateDebutP": "", "DateFinP": "" }]
        },
        {
          "Name": "ADI2",
          "Nombre": 0,
          "Periode": [{ "DateDebutP": "", "DateFinP": "" }]
        },
        {
          "Name": "CIR1",
          "Nombre": 0,
          "Periode": [{ "DateDebutP": "", "DateFinP": "" }]
        }
        ,
        {
          "Name": "CIR2",
          "Nombre": 0,
          "Periode": [{ "DateDebutP": "", "DateFinP": "" }]
        },
        {
          "Name": "AP3",
          "Nombre": 0,
          "Periode": [{ "DateDebutP": "", "DateFinP": "", "nbSemaineP": 4 },
          { "DateDebutP": "", "DateFinP": "", "nbSemaineP": 4 },
          { "DateDebutP": "", "DateFinP": "", "nbSemaineP": 4 },
          { "DateDebutP": "", "DateFinP": "", "nbSemaineP": 4 },
          { "DateDebutP": "", "DateFinP": "", "nbSemaineP": 4 }
          ]
        },
        {
          "Name": "AP4",
          "Nombre": 0,
          "Periode": [{ "DateDebutP": "", "DateFinP": "", "nbSemaineP": 8 },
          { "DateDebutP": "", "DateFinP": "", "nbSemaineP": 8 },
          { "DateDebutP": "", "DateFinP": "", "nbSemaineP": 8 },
          { "DateDebutP": "", "DateFinP": "", "nbSemaineP": 8 }
          ]

        },
        {
          "Name": "AP5",
          "Nombre": 0,
          "Periode": [{ "DateDebutP": "", "DateFinP": "", "nbSemaineP": 10 },
          { "DateDebutP": "", "DateFinP": "", "nbSemaineP": 10 }
          ]
        }
        ,
        {
          "Name": "ISEN3",
          "Nombre": 0,
          "Periode": [{ "DateDebutP": "", "DateFinP": "" }]
        },
        {
          "Name": "ISEN4",
          "Nombre": 0,
          "Periode": [{ "DateDebutP": "", "DateFinP": "" }]
        },
        {
          "Name": "ISEN5",
          "Nombre": 0,
          "Periode": [{ "DateDebutP": "", "DateFinP": "" }]
        }
      ]
  });

  const [isButtonDisabled, setIsButtonDisabled] = React.useState(true);
  const [loading, setLoading] = React.useState(true); // État pour le chargement

  const isAllDataFilled = () => {
    const { DateDeb, DateFin, Promos } = promosData;

    if (!DateDeb || !DateFin) {
      return false;
    }

    for (const promo of Promos) {
      if (promo.Nombre > 0) {
        for (const periode of promo.Periode) {
          if (!periode.DateDebutP || !periode.DateFinP || promo.Nombre === 0) {
            return false;
          }
        }
      }
    }
    return true;
  }

  useEffect(() => {
    const fetchPromosData = async () => {
      try {
        const response = await fetch('http://localhost:3000/getPromosData');
        const data = await response.json();
        setPromosData(data);
      } catch (error) {
        console.error('Error fetching promos data:', error);
      } finally {
        setLoading(false); // Met à jour l'état de chargement
      }
    };

    fetchPromosData();
  }, []); // Appel à l'API backend au premier rendu

  const isInitialMount = useRef(0);

  useEffect(() => {
    // Incrémente le compteur à chaque rendu
    isInitialMount.current += 1;

    // Si le compteur est inférieur à 3, ne pas exécuter le code
    if (isInitialMount.current < 3) {
      return;
    }

    setIsButtonDisabled(!isAllDataFilled());

    const majPromosData = async () => {
      try {
        const response = await fetch('http://localhost:3000/setPromosData', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(promosData)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error('Error fetching promos data:', error);
      }
    };

    majPromosData();
  }, [promosData]);



  const handleSubmit = async () => {
    try {
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

  if (!loading) {
    return (
      <div>
        <TopBar />
        <DebFinCalendrier promosData={promosData} setPromosData={setPromosData} />
        <FullWidthTabs promosData={promosData} setPromosData={setPromosData} />
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isButtonDisabled}
          sx={{
            backgroundColor: '#242424',  // Couleur d'arrière-plan personnalisée
            color: '#FFFFFF',            // Couleur du texte
            '&:hover': {
              backgroundColor: '#E64A19',  // Couleur lorsque l'on survole le bouton
            },
            mt: 3,
          }}
        >
          Générer Macro
        </Button>    </div>
    );
  } else {
    return <div>Chargement...</div>;
  };
}

export default Parametres;