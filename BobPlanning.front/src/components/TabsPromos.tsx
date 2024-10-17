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

const CustomTabs = styled(Tabs)(({ }) => ({
    backgroundColor: '#333', // Tabs background color
    '& .MuiTabs-indicator': {
        backgroundColor: '#FF5722', // Customize the indicator color
        height: '4px', // Increase the thickness of the indicator
    },
}));

const CustomTab = styled(Tab)(({ }) => ({
    textTransform: 'none', // Prevent uppercase
    color: '#FFFFFF', // Default tab text color
    fontSize: '16px', // Change font size
    fontWeight: 'bold', // Change font weight
    '&.Mui-selected': {
        color: '#FFC107', // Color when the tab is selected
    },
    '&:hover': {
        color: '#FFD700', // Hover color
    },
}));


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
                    <div>{children}</div>
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

export default function FullWidthTabs({ setPromosData, promosData }: FullWidthTabsProps & { setPromosData: React.Dispatch<React.SetStateAction<any>> }) {
    const theme = useTheme();
    const [value, setValue] = React.useState(0);

    const [classesPerPromo, setClassesPerPromo] = React.useState<Record<string, string>>({
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
        console.log("promosData : ", promosData);
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
                        Periode: promo.Periode.map((periode: any, index: number) =>
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
                        Periode: promo.Periode.map((periode: any, index: number) =>
                            index === 0 ? { ...periode, dateFinP: newValue } : periode // Mise à jour de dateDebutP
                        ),
                    }
                    : promo
            ),
        }));

    }

    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            minHeight: '100vh',
        }}>
            <Box sx={{ bgcolor: 'background.paper', width: 1050 }}>
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
                                    color: '#FF5722',
                                    fontWeight: 'bold',
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
