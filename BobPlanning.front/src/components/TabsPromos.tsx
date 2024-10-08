import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import SingleDropdown from './SingleDropdown';
import DebCoursDate from './DebCoursDate';
import PeriodesAP from './PeriodesAP';

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

export default function FullWidthTabs() {
    const theme = useTheme();
    const [value, setValue] = React.useState(0);
    
    const promos = [
        'ADI1', 'ADI2', 
        'CIR1', 'CIR2', 
        'AP3', 'AP4', 'AP5', 
        'ISEN3', 'ISEN4', 'ISEN5'
      ];

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
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
                    <SingleDropdown/>
                    <DebCoursDate/> 
                    {(promo === 'AP3' || promo === 'AP4' || promo === 'AP5') && (
                        <PeriodesAP />
                    )}

                </TabPanel>
            ))}
        </Box>
        </Box>
    );
}
