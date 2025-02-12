import React, { useEffect, useRef } from 'react';
import DebFinCalendrier from '../components/DebFinCalendrier';
import TabsPromos from '../components/TabsPromos';
import { useNavigate } from 'react-router-dom';
import './Parametres.css';
import Bouton from '../components/Bouton';
import DownloadButton from '../components/DownloadButton';
import Loading from '../components/Loading';

const RACINE_FETCHER_URL = process.env.VITE_RACINE_FETCHER_URL;

const Parametres: React.FC = () => {
  const navigate = useNavigate();
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
  const [isMicroButtonDisabled, setIsMicroButtonDisabled] = React.useState(true);
  const [loading, setLoading] = React.useState(true); // État pour le chargement

  const [message, setMessage] = React.useState<string | null>(null);
  const [fileUrl, setFileUrl] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const isAllDataFilled = () => {
    const { DateDeb, DateFin, Promos } = promosData;
    console.log("Vérification des données:", { DateDeb, DateFin, Promos });
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
        console.log('fetcher url:', RACINE_FETCHER_URL);
        
        const response = await fetch(`${RACINE_FETCHER_URL}/getPromosData`);
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
    setIsMicroButtonDisabled(!isAllDataFilled());

    const majPromosData = async () => {
      try {
        const response = await fetch(`${RACINE_FETCHER_URL}/setPromosData`, {
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
    setIsLoading(true);
    try {
      const response = await fetch(`${RACINE_FETCHER_URL}/generateEdtMacro`, {
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
      setMessage('Le fichier a été généré avec succès !');
      setFileUrl(data.fileUrl);

    } catch (error) {
      console.error('Error:', error);
      setMessage('Erreur lors de la génération du fichier.');
    } finally {
      setIsLoading(false); // Fin du chargement
    }
  };

  if (!loading) {

    return (

      <div className="container">
        <DebFinCalendrier promosData={promosData} setPromosData={setPromosData} />
        <TabsPromos promosData={promosData} setPromosData={setPromosData} />

        <div className="buttons-container">


          <Bouton
            onClick={handleSubmit}
            disabled={isButtonDisabled}
            variant="contained"
          >
            Générer la Macro
          </Bouton>



          <Bouton
            onClick={() => navigate('/parametresMicro', { state: { promosData } })}
            disabled={isMicroButtonDisabled}
            variant="contained"
            className="secondary-button"
          > Paramètres Micro →
          </Bouton>
        </div>
        {isLoading &&
          <div className="loading-container">
            <Loading />
          </div>}

        {/* Afficher le message et le lien de téléchargement */}
        {message && <div className='message-success'>{message}</div>}
        {fileUrl && (
          <DownloadButton fileUrl={fileUrl} label="Télécharger le fichier" />
        )}
      </div>
    );
  } else {
    return <div className="loading-container">
      <Loading />
    </div>
  };
}

export default Parametres;