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
  promosData: PromosData; // UseState du composant parent
}

export default function TabPromosMicro({ promosData }: FullWidthTabsProps) {
  const theme = useTheme();
  const [value, setValue] = React.useState(0);

  const promos = [
    'ADI1', 'ADI2',
    'CIR1', 'CIR2',
    'AP3', 'AP4', 'AP5',
    'ISEN3', 'ISEN4', 'ISEN5',
  ];

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
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
        {promos.map((promo, index) => (
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
              <InputFileUpload />
            </div>

          </TabPanel>
        ))}
      </Box>
    </Box>

  );
}
