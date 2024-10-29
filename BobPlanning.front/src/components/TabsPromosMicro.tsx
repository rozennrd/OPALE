import * as React from 'react';
import { useTheme, styled } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import PromosData from '../models/promosData';
import InputFileUpload from './InputFileUpload'; 

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
        <Box
          sx={{
            p: 3,
            backgroundColor: '#F0F0F0',  // Couleur de fond ajoutée ici
            borderRadius: '8px',  // Facultatif : arrondir les coins
            minHeight: '100vh',  // Facultatif : fixer une hauteur minimale
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
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
  promosData: PromosData; // UseState du composant parent
}

export default function TabPromosMicro({ promosData }: FullWidthTabsProps) {
  const theme = useTheme();
  const [value, setValue] = React.useState(0);

  const promos = [
    'ADI1', 'ADI2',
    'CIR1', 'CIR2',
    'AP3', 'AP4', 'AP5',
    'ISEN3', 'ISEN4', 'ISEN5'
  ];

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

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
            {/* Empty Content - No components here */}
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
            <Typography     
                variant="h6"
                gutterBottom
                sx={{
                    textAlign: 'left',
                    color: '#333',
                    fontWeight: 'bold',
                    marginBottom: '20px'
                }}      
            >   
            Importer maquette 
            </Typography>
            <InputFileUpload />
          </TabPanel>
        ))}
      </Box>
    </Box>
  );
}
