import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Paper from '@mui/material/Paper';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { Hidden, Stack } from '@mui/material';
import Check from './Check';
import Review from './Review';
import { MapContainer, TileLayer, useMap, Marker } from 'react-leaflet'
import { Popup } from 'leaflet';
import Map from '../map/Map';
import "leaflet/dist/leaflet.css"
import zIndex from '@mui/material/styles/zIndex';
const steps = ['Check UUID', 'Review your transaction'];

function getStepContent(step: number) {
  switch (step) {
    case 0:
      return <Check />;
    case 1:
      return <Review />;  
    default:
      throw new Error('Unknown step');
  }
}

export default function Checkout() {
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  return (
    <>
      <Stack direction="row" justifyContent="end" marginTop={3} overflow={'Hidden'}>
        <Paper variant="outlined"  sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 }, height: '100vh', overflow:'hidden'}}>
          <Typography component="h1" variant="h4" align="center">
            Ayala Beep Tap-in
          </Typography>
          <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {activeStep === steps.length ? (
            <React.Fragment>
              <Typography variant="h5" gutterBottom>
                Thank you for using MRT!
              </Typography>
              <Typography variant="subtitle1">
                We appreciate your commitment to a seamless and efficient travel experience. 
                Should you need any assistance or information, our staff is here to help. 
                Have a safe and pleasant commute!
              </Typography>
            </React.Fragment>
          ) : (
            <React.Fragment>
              {getStepContent(activeStep)}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                {activeStep > 0 && (
                  <Button onClick={handleBack} sx={{ mt: 3, ml: 1 }}>
                    Back
                  </Button>
                )}
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{ mt: 3, ml: 1 }}
                >
                  {activeStep === steps.length - 1 ? 'Confirm' : 'Next'}
                </Button>
              </Box>
            </React.Fragment>
          )}
        </Paper>
      </Stack>
    </>
  );
}
