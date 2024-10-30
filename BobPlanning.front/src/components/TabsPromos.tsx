import * as React from 'react';
import { useTheme, styled } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import DebCoursDate from './DebCoursDate';
import FinCoursDate from './FinCoursDate';
import Periodes from './Periodes';
import NombreClasseDropdown from './NombreClasseDropdown';
import PromosData from '../models/promosData';

interface TabPanelProps {
    children?: React.ReactNode;
    dir?: string;
    index: number;
    value: number;
}

const CustomTabs = styled(Tabs)(() => {
  // Récupérer les variables CSS définies dans :root
  const rootStyles = getComputedStyle(document.documentElement);
  const primaryColor = rootStyles.getPropertyValue('--primary-color').trim();
  const secondaryColor = rootStyles.getPropertyValue('--secondary-color').trim();

  return {
    backgroundColor: secondaryColor, // Utiliser la couleur secondaire
    '& .MuiTabs-indicator': {
      backgroundColor: primaryColor, // Utiliser la couleur principale pour l'indicateur
      height: '4px', // Épaisseur de l'indicateur
    },
  };
});


const CustomTab = styled(Tab)(() => {
    // Récupérer les variables CSS définies dans :root
    const rootStyles = getComputedStyle(document.documentElement);
    const textColor = rootStyles.getPropertyValue('--text-color-dark-bg').trim();
    const textColorDark = rootStyles.getPropertyValue('--text-color').trim();
    const primaryColor = rootStyles.getPropertyValue('--primary-color').trim();
  
    return {
      textTransform: 'none', // Empêcher la mise en majuscule
      color: textColor, // Couleur par défaut du texte des onglets
      fontSize: '16px', // Changer la taille de police
      '&.Mui-selected': {
        color: primaryColor, // Couleur lorsque l'onglet est sélectionné
      },
      '&:hover': {
        color: textColorDark, // Couleur au survol
      },
    };
  });
  

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
  

function a11yProps(index: number) {
    return {
        id: `full-width-tab-${index}`,
        'aria-controls': `full-width-tabpanel-${index}`,
    };
}

interface FullWidthTabsProps {
    setPromosData: React.Dispatch<React.SetStateAction<any>>;
    promosData: PromosData; // UseSate du composant parent
}

export default function TabsPromos({ setPromosData, promosData }: FullWidthTabsProps & { setPromosData: React.Dispatch<React.SetStateAction<any>> }) {
    const theme = useTheme();
    const [value, setValue] = React.useState(0);

    const [classesPerPromo, setClassesPerPromo] = React.useState<Record<string, string>>({
        ADI1:  String(promosData.Promos[0].Nombre),
        ADI2:  String(promosData.Promos[1].Nombre),
        CIR1:  String(promosData.Promos[2].Nombre),
        CIR2:  String(promosData.Promos[3].Nombre),
        AP3:   String(promosData.Promos[4].Nombre),
        AP4:   String(promosData.Promos[5].Nombre),
        AP5:   String(promosData.Promos[6].Nombre),
        ISEN3: String(promosData.Promos[7].Nombre),
        ISEN4: String(promosData.Promos[8].Nombre),
        ISEN5: String(promosData.Promos[9].Nombre)
    });

    const [startDatesPerPromo, setStartDatesPerPromo] = React.useState<Record<string, string>>({
        ADI1:  String(promosData.Promos[0].Periode[0].DateDebutP),
                ADI2:  String(promosData.Promos[1].Periode[0].DateDebutP),
                CIR1:  String(promosData.Promos[2].Periode[0].DateDebutP),
                CIR2:  String(promosData.Promos[3].Periode[0].DateDebutP),
                AP3:   String(promosData.Promos[4].Periode[0].DateDebutP),
                AP4:   String(promosData.Promos[5].Periode[0].DateDebutP),
                AP5:   String(promosData.Promos[6].Periode[0].DateDebutP),
                ISEN3: String(promosData.Promos[7].Periode[0].DateDebutP),
                ISEN4: String(promosData.Promos[8].Periode[0].DateDebutP),
                ISEN5: String(promosData.Promos[9].Periode[0].DateDebutP)
    });
    const [endDatesPerPromo, setEndDatesPerPromo] = React.useState<Record<string, string>>({
        ADI1:  String(promosData.Promos[0].Periode[0].DateFinP),
            ADI2:  String(promosData.Promos[1].Periode[0].DateFinP),
            CIR1:  String(promosData.Promos[2].Periode[0].DateFinP),
            CIR2:  String(promosData.Promos[3].Periode[0].DateFinP),
            AP3:   String(promosData.Promos[4].Periode[0].DateFinP),
            AP4:   String(promosData.Promos[5].Periode[0].DateFinP),
            AP5:   String(promosData.Promos[6].Periode[0].DateFinP),
            ISEN3: String(promosData.Promos[7].Periode[0].DateFinP),
            ISEN4: String(promosData.Promos[8].Periode[0].DateFinP),
            ISEN5: String(promosData.Promos[9].Periode[0].DateFinP)
    });

    React.useEffect(() => {
        // Initialisation des classes
        setClassesPerPromo({
            ADI1:  String(promosData.Promos[0].Nombre),
            ADI2:  String(promosData.Promos[1].Nombre),
            CIR1:  String(promosData.Promos[2].Nombre),
            CIR2:  String(promosData.Promos[3].Nombre),
            AP3:   String(promosData.Promos[4].Nombre),
            AP4:   String(promosData.Promos[5].Nombre),
            AP5:   String(promosData.Promos[6].Nombre),
            ISEN3: String(promosData.Promos[7].Nombre),
            ISEN4: String(promosData.Promos[8].Nombre),
            ISEN5: String(promosData.Promos[9].Nombre)
        });
    
        setStartDatesPerPromo(
            {
                ADI1:  String(promosData.Promos[0].Periode[0].DateDebutP),
                ADI2:  String(promosData.Promos[1].Periode[0].DateDebutP),
                CIR1:  String(promosData.Promos[2].Periode[0].DateDebutP),
                CIR2:  String(promosData.Promos[3].Periode[0].DateDebutP),
                AP3:   String(promosData.Promos[4].Periode[0].DateDebutP),
                AP4:   String(promosData.Promos[5].Periode[0].DateDebutP),
                AP5:   String(promosData.Promos[6].Periode[0].DateDebutP),
                ISEN3: String(promosData.Promos[7].Periode[0].DateDebutP),
                ISEN4: String(promosData.Promos[8].Periode[0].DateDebutP),
                ISEN5: String(promosData.Promos[9].Periode[0].DateDebutP)
            }
        );
        setEndDatesPerPromo({
            ADI1:  String(promosData.Promos[0].Periode[0].DateFinP),
            ADI2:  String(promosData.Promos[1].Periode[0].DateFinP),
            CIR1:  String(promosData.Promos[2].Periode[0].DateFinP),
            CIR2:  String(promosData.Promos[3].Periode[0].DateFinP),
            AP3:   String(promosData.Promos[4].Periode[0].DateFinP),
            AP4:   String(promosData.Promos[5].Periode[0].DateFinP),
            AP5:   String(promosData.Promos[6].Periode[0].DateFinP),
            ISEN3: String(promosData.Promos[7].Periode[0].DateFinP),
            ISEN4: String(promosData.Promos[8].Periode[0].DateFinP),
            ISEN5: String(promosData.Promos[9].Periode[0].DateFinP)
        });
    }, [promosData]);
    


    const promos = [
        'ADI1', 'ADI2',
        'CIR1', 'CIR2',
        'AP3', 'AP4', 'AP5',
        'ISEN3', 'ISEN4', 'ISEN5'
    ];

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const handleDropdownChange = (promoName: string, selectedValue: string) => {
        setClassesPerPromo((prev) => ({
            ...prev,
            [promoName]: selectedValue
        }));
        setPromosData((prevData: any) => ({
            ...prevData,
            Promos: prevData.Promos.map((promo: any) =>
                promo.Name === promoName
                    ? { ...promo, Nombre: selectedValue } // Mise à jour du "Nombre" pour "AP4"
                    : promo // Laisser les autres promos inchangées
            ),
        }));
    }

    const handleStartDateChange = (promoName: string, newValue: string) => {
        setStartDatesPerPromo((prev) => ({
            ...prev,
            [promoName]: newValue
        }));

        console.log("promosData", promosData);
    
        // Mise à jour des dates de début dans PromosData
        setPromosData((prevData: any) => {
            const newPromosData = {
                ...prevData,
                Promos: prevData.Promos.map((promo: any) =>
                    promo.Name === promoName
                        ? {
                            ...promo,
                            Periode: promo.Periode.map((periode: any, index: number) =>
                                index === 0 ? { ...periode, DateDebutP: newValue } : periode
                            ),
                        }
                        : promo
                ),
            };
    
            const firstDateDebutP = newValue;
            const isFirstPromo = ["ADI1", "ADI2", "CIR1", "CIR2", "ISEN3", "ISEN4", "ISEN5"].includes(promoName);
    
            // Si c'est la première promo, propager les dates
            if (isFirstPromo && firstDateDebutP) {
                return propagateDatesToOtherPromos(newPromosData, firstDateDebutP, '');
            }
    
            return newPromosData;
        });
    };
    
    const handleEndDateChange = (promoName: string, newValue: string) => {
        setEndDatesPerPromo((prev) => ({
            ...prev,
            [promoName]: newValue
        }));
    
        // Mise à jour des dates de fin dans PromosData
        setPromosData((prevData: any) => {
            const newPromosData = {
                ...prevData,
                Promos: prevData.Promos.map((promo: any) =>
                    promo.Name === promoName
                        ? {
                            ...promo,
                            Periode: promo.Periode.map((periode: any, index: number) =>
                                index === 0 ? { ...periode, DateFinP: newValue } : periode
                            ),
                        }
                        : promo
                ),
            };
    
            const firstDateFinP = newValue;
            const isFirstPromo = ["ADI1", "ADI2", "CIR1", "CIR2", "ISEN3", "ISEN4", "ISEN5"].includes(promoName);
    
            // Si c'est la première promo, propager les dates
            if (isFirstPromo && firstDateFinP) {
                return propagateDatesToOtherPromos(newPromosData, '', firstDateFinP);
            }
    
            return newPromosData;
        });
    };    
    
    const propagateDatesToOtherPromos = (
        promosData: PromosData,
        firstDateDebutP: string,
        firstDateFinP: string
    ) => {
        const promoNames = ["ADI1", "ADI2", "CIR1", "CIR2", "ISEN3", "ISEN4", "ISEN5"];
        
        const updatedPromosData = { ...promosData };
    
        // Objets pour stocker les nouvelles valeurs des UseState
        const newStartDatesPerPromo: Record<string, string> = {};
        const newEndDatesPerPromo: Record<string, string> = {};
    
        promoNames.forEach((promoName) => {
            const promo = updatedPromosData.Promos?.find((p: { Name: string }) => p.Name === promoName);
            if (promo) {
                promo.Periode.forEach((periode) => {
                    // Mettre à jour uniquement si le champ est vide
                    if (!periode.DateDebutP && firstDateDebutP) {
                        periode.DateDebutP = firstDateDebutP;
                        newStartDatesPerPromo[promoName] = firstDateDebutP;  // Mettre à jour le UseState localement
                    }
                    if (!periode.DateFinP && firstDateFinP) {
                        periode.DateFinP = firstDateFinP;
                        newEndDatesPerPromo[promoName] = firstDateFinP;  // Mettre à jour le UseState localement
                    }
                });
            }
        });
    
        // Mise à jour des UseState après la boucle
        setStartDatesPerPromo((prev) => ({
            ...prev,
            ...newStartDatesPerPromo,  // Ajouter les nouvelles valeurs pour les promos concernées
        }));
    
        setEndDatesPerPromo((prev) => ({
            ...prev,
            ...newEndDatesPerPromo,  // Ajouter les nouvelles valeurs pour les promos concernées
        }));
    
        return updatedPromosData;
    };
    
    
    

    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%'
        }}>
            <Box sx={{width: '100%'}}>
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
                {promos.map((promo, index) => (
                    <TabPanel value={value} index={index} dir={theme.direction} key={index}>
                        {/* Content of each TabPanel can be anything you want */}
                        <Box>
                            <Typography
                                variant="h4"
                                gutterBottom
                                sx={{
                                    textAlign: 'left',
                                    color: 'var(--primary-color)',
                                    
                                    marginBottom: '20px'
                                }}
                            >
                                {promo}
                            </Typography>
                            <NombreClasseDropdown
                                promoName={promo}
                                selectedValue={classesPerPromo[promo]}
                                onChange={handleDropdownChange}
                            />
                        </Box>
                        {(promo === 'ADI1' || promo === 'ADI2' || promo === 'CIR1' || promo === 'CIR2' || promo === 'ISEN3' || promo === 'ISEN4' || promo === 'ISEN5') && (

                            <>
                                <DebCoursDate
                                    startDate={startDatesPerPromo[promo]}
                                    setStartDate={(date) => handleStartDateChange(promo, date)}
                                />
                                <FinCoursDate
                                    endDate={endDatesPerPromo[promo]}
                                    setEndDate={(date) => handleEndDateChange(promo, date)}
                                />
                            </>
                        )}


                        {(promo === 'AP3' || promo === 'AP4' || promo === 'AP5') && (
                            <Periodes
                                promoName={promo}
                                promosData={promosData}
                                setPromosData={setPromosData}
                            />
                        )}

                    </TabPanel>
                ))}
            </Box>
        </Box>
    );
}
