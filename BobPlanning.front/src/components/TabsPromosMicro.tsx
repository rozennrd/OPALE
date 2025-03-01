import * as React from 'react';
import { useTheme, styled } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
// @ts-ignore
import PromosData from '../models/promosData';
import InputFileUpload from './InputFileUpload';
import MaquetteDisplayTest from './MaquetteDisplayTest';
const RACINE_FETCHER_URL = import.meta.env.VITE_RACINE_FETCHER_URL;

interface Course {
  promo: string;
  name: string;
  UE: string;
  semestre: string;
  Periode: string;
  Prof: string;
  typeSalle: string;
  heure: string; // JSON sous forme de string
}

interface UE {
  name: string;
}
// Liste des noms de promotions
const promos = [
  'ADI1', 'ADI2',
  'CIR1', 'CIR2',
  'AP3', 'AP4', 'AP5',
  'ISEN3', 'ISEN4', 'ISEN5',
];

interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: number;
  value: number;
}
// Composant stylé pour les onglets
const CustomTabs = styled(Tabs)(() => {
  const rootStyles = getComputedStyle(document.documentElement);
  const primaryColor = rootStyles.getPropertyValue('--primary-color').trim();
  const secondaryColor = rootStyles.getPropertyValue('--secondary-color').trim();

  return {
    backgroundColor: secondaryColor,
    '& .MuiTabs-indicator': {
      backgroundColor: primaryColor,
      height: '4px',
    },
  };
});

// Composant stylé pour un onglet individuel
const CustomTab = styled(Tab)(() => {
  const rootStyles = getComputedStyle(document.documentElement);
  const textColor = rootStyles.getPropertyValue('--text-color-dark-bg').trim();
  const textColorDark = rootStyles.getPropertyValue('--text-color').trim();
  const primaryColor = rootStyles.getPropertyValue('--primary-color').trim();

  return {
    textTransform: 'none',
    color: textColor,
    fontSize: '16px',

    '&.Mui-selected': {
      color: primaryColor,
    },
    '&:hover': {
      color: textColorDark,
    },
  };
});

// Composant pour afficher le contenu d'un onglet
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box
          sx={{
            p: 3,

          }}
        >
          {children}
        </Box>
      )}
    </div>
  );
}

// Propriétés pour les onglets accessibles
function a11yProps(index: number) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

// Propriétés du composant principal
interface FullWidthTabsProps {
  promosData: PromosData; // UseState du composant parent
}

// Composant principal
export default function TabPromosMicro({ }: FullWidthTabsProps) {
  const theme = useTheme();
  const [value, setValue] = React.useState(0);
  const [cours, setCours] = React.useState<Course[]>([]);
  const [reloadData, setReloadData] = React.useState(false);
  
  
  const handleMaquetteUpload = () => {
    setReloadData((prev) => !prev); 
  };

  
  const extractUE = (cours: Course[], promo: string): UE[] => {
    const ueSet = new Set(cours.filter((course) => course.promo === promo).map((course) => course.UE));
    return Array.from(ueSet).map((ue) => ({ name: ue }));
  };

  React.useEffect(() => {
    const fetchCours = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`${RACINE_FETCHER_URL}/getCours`, {
          method: 'GET',
          headers: {
            "x-access-token": token ?? "", // Ajouter le token dans l'en-tête
          },
        });
        const data = await response.json();
        setCours([...data]);
        console.log(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des cours :", error);
      }
    }
    fetchCours();
  }, [reloadData]);




  // État pour stocker les fichiers importés pour chaque promo
  const [uploadedFiles, setUploadedFiles] = React.useState<Record<string, File | null>>({
    ADI1: null,
    ADI2: null,
    CIR1: null,
    CIR2: null,
    AP3: null,
    AP4: null,
    AP5: null,
    ISEN3: null,
    ISEN4: null,
    ISEN5: null,
  });

  //fonction callback pour gérer l'importation  de fichiers
  const handleFileUpload = (promo: string, file: File) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [promo]: file,
    }));

  };

  //objet pour stocker les données de réponse de l'API
  const [responseData, setResponseData] = React.useState<Record<string, any>>({
    ADI1: null,
    ADI2: null,
    CIR1: null,
    CIR2: null,
    AP3: null,
    AP4: null,
    AP5: null,
    ISEN3: null,
    ISEN4: null,
    ISEN5: null,
  });

  //fonction callback pour gérer les données de réponse de l'API
  const handleResponseData = (promo: string, data: any) => {
    setResponseData((prev) => ({
      ...prev,
      [promo]: data,
    }));
  };


  // Gestion du changement d'onglet
  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  // Récupérer le nom de promo sans le dernier caractère
  const getPromoName = (promo: string) => promo.slice(0, -1);

  return (

    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',

        width: '100%',
      }}
    >
      <Box sx={{ width: '100%' }}>
        <AppBar position="static">
          <CustomTabs
            value={value}
            onChange={handleChange}
            indicatorColor="secondary"
            textColor="inherit"
            variant="fullWidth"
            aria-label="full width tabs example"
          >
            {promos.map((promo, index) => (
              <CustomTab label={promo} key={index} {...a11yProps(index)} />
            ))}
          </CustomTabs>
        </AppBar>
        {promos.map((promo, index) => 
        {
          const formattedData = React.useMemo(() => ({
            UE: extractUE([...cours], promo), // ✅ Nouvelle référence pour éviter les valeurs figées
            cours: cours
              .filter((course) => course.promo === promo)
              .map((course) => ({
                promo: course.promo,   
                name: course.name,
                UE: course.UE,
                semestre: course.semestre ? course.semestre.split(',').map(Number) : [],
                Periode: course.Periode,
                Prof: course.Prof,
                typeSalle: course.typeSalle,
                heure: JSON.parse(course.heure),
              })),
            reloadData, // ✅ Ajouté en tant que dépendance
          }), [cours, reloadData]);
          return(
            
          <TabPanel value={value} index={index} dir={theme.direction} key={index}>
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                textAlign: 'left',
                color: 'var(--primary-color)',
                fontWeight: 'bold',
                marginBottom: '20px',
              }}
            >
              {promo}
            </Typography>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flexDirection: 'column' }}>
              <h4>Importer la maquette  {getPromoName(promo)}  </h4>
              <InputFileUpload
                promoName={promo}
                onFileUpload={(file) => handleFileUpload(promo, file)}
                uploadedFile={uploadedFiles[promo]}
                responseData={responseData[promo]}
                onResponseData={(date) => handleResponseData(promo, date)}
                onMaquetteUpload={handleMaquetteUpload}   
              />
              
              <MaquetteDisplayTest
                data={formattedData}
                
              />


            </div>

          </TabPanel> );
        
        })}
      </Box>
    </Box>

  );
}
