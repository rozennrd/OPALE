import React from 'react';
import { useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import DebCoursDate from './DebCoursDate';
import FinCoursDate from './FinCoursDate';
import PeriodesAP from './PeriodesAP';
import NombreClasseDropdown from './NombreClasseDropdown';

interface TabPanelProps {
    children?: React.ReactNode;
    dir?: string;
    index: number;
    value: number;
}

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
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
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
    promosData: any; // UseSate du composant parent
}

export default function FullWidthTabs({ setPromosData, promosData }: FullWidthTabsProps & { setPromosData: React.Dispatch<React.SetStateAction<any>> }) {
    const theme = useTheme();
    const [value, setValue] = React.useState(0);
    
    const [classesPerPromo, setClassesPerPromo] = React.useState<Record<string,string>>({
        ADI1: '',
        ADI2: '',
        CIR1: '',
        CIR2: '',
        AP3: '',
        AP4: '',
        AP5: '',
        ISEN3: '',
        ISEN4: '',
        ISEN5: ''
    });

    const [startDatesPerPromo, setStartDatesPerPromo] = React.useState<Record<string, string>>({
        ADI1: '',
        ADI2: '',
        CIR1: '',
        CIR2: '',
        AP3: '',
        AP4: '',
        AP5: '',
        ISEN3: '',
        ISEN4: '',
        ISEN5: ''
    });
    const [endDatesPerPromo, setEndDatesPerPromo] = React.useState<Record<string, string>>({
        ADI1: '',
        ADI2: '',
        CIR1: '',
        CIR2: '',
        AP3: '',
        AP4: '',
        AP5: '',
        ISEN3: '',
        ISEN4: '',
        ISEN5: ''
    });

    const [periodesData, setPeriodesData] = React.useState<Record<string, {nombrePeriode: number, dates:Date[], weeks: number[]}>>( {
        AP3: {nombrePeriode: 5, dates: Array(5).fill(''), weeks: Array(5).fill(3)},
        AP4: {nombrePeriode: 4, dates: Array(4).fill(''), weeks: Array(4).fill(3)},
        AP5: {nombrePeriode: 2, dates: Array(2).fill(''), weeks: Array(2).fill(3)}  
    });

    const promos = [
        'ADI1', 'ADI2', 
        'CIR1', 'CIR2', 
        'AP3', 'AP4', 'AP5', 
        'ISEN3', 'ISEN4', 'ISEN5'
    ];

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
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
        console.log('selectedValue:', selectedValue);
        console.log('Promos Data:', promosData);
    }

    const handleStartDateChange = (promoName: string, newValue: string) => {
        setStartDatesPerPromo((prev) => ({
            ...prev,
            [promoName]: newValue
        }));
        setPromosData((prevData: any) => ({
            ...prevData,
            Promos: prevData.Promos.map((promo: any) =>
                promo.Name === promoName 
                    ? {
                        ...promo,
                        Periodes: promo.Periodes.map((periode: any, index: number) =>
                            index === 0 ? { ...periode, dateDebutP: newValue } : periode // Mise à jour de dateDebutP
                        ),
                    }
                    : promo
            ),
        }));
        
        
    }

    const handleEndDateChange = (promoName: string, newValue: string) => {
        setEndDatesPerPromo((prev) => ({
            ...prev,
            [promoName]: newValue
        }));
        setPromosData((prevData: any) => ({
            ...prevData,
            Promos: prevData.Promos.map((promo: any) =>
                promo.Name === promoName 
                    ? {
                        ...promo,
                        Periodes: promo.Periodes.map((periode: any, index: number) =>
                            index === 0 ? { ...periode, dateFinP: newValue } : periode // Mise à jour de dateDebutP
                        ),
                    }
                    : promo
            ),
        }));
        
    }

    const handlePeriodesChange = (promoName: string, nombrePeriode: number, startDate: Date[], weeks: number[]) => {
        setPromosData((prevData: any) => ({
            ...prevData,
            Promos: prevData.Promos.map((promo: any) =>
                promo.Name === promoName 
                    ? {
                        ...promo,
                        Periodes: Array.from({ length: nombrePeriode }, (_, index) => {
                            const start = new Date(startDate[index]);
                            start.setDate(start.getDate() + weeks.slice(0, index).reduce((acc, week) => acc + (week * 7), 0)); // Calculer la date de début de chaque période
                            const end = new Date(start);
                            end.setDate(end.getDate() + weeks[index] * 7); // Calculer la date de fin en fonction du nombre de semaines
    
                            return {
                                DateDebutP: start.toLocaleDateString('fr-FR'), // Format dd/mm/yyyy
                                DateFinP: end.toLocaleDateString('fr-FR'),     // Format dd/mm/yyyy
                            };
                        }),
                    }
                    : promo // Laisser les autres promos inchangées
            ),
        }));
    };
    

    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'center', 
            minHeight: '100vh',       
        }}>
            <Box sx={{ bgcolor: 'background.paper',width: 1000}}>
                <AppBar position="static">
                    <Tabs
                        value={value}
                        onChange={handleChange}
                        indicatorColor="secondary"
                        textColor="inherit"
                        variant="fullWidth"
                        aria-label="full width tabs example"
                    >
                        {promos.map((promo, index) => (
                            <Tab label={promo} key={index} {...a11yProps(index)} />
                        ))}
                    </Tabs>
                </AppBar>
                {promos.map((promo, index) => (
                    <TabPanel value={value} index={index} dir={theme.direction} key={index}>
                        {/* Content of each TabPanel can be anything you want */}
                        <NombreClasseDropdown
                            promoName={promo}
                            selectedValue={classesPerPromo[promo]}
                            onChange={handleDropdownChange}
                        />
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
                            <PeriodesAP 
                                nbPeriodesDefaultValue={periodesData[promo].nombrePeriode}
                                dates={periodesData[promo].dates}
                                weeks={periodesData[promo].weeks}
                                onChange={(nombrePeriode, dates, weeks) => handlePeriodesChange(promo, nombrePeriode, dates, weeks)}
                            />
                        )}
                    </TabPanel>
                ))}
            </Box>
        </Box>
    );
}
