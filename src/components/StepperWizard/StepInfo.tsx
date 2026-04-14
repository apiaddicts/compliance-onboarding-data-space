import { Box, Typography, Grid, Card, CardActionArea } from '@mui/material';
import { useTranslation } from 'react-i18next';
import './StepperWizard.scss';

const SHAPES = ['Participant', 'Service Offering', 'Terms and Conditions'];

interface InfoProp {
  selectedShape: string | null;
  setSelectedShape: (shape: string | null) => void;
  setActiveStep: (activeStep: number) => void;
  setErrorManager: (errorManager: { show: boolean; message: string }) => void;
}

export const InfoView = ( { selectedShape, setSelectedShape, setActiveStep, setErrorManager }: InfoProp ) => {
  const { t } = useTranslation();
  const handleNext = (shape: string) => {
    setErrorManager({ show: false, message: '' });
    setActiveStep(0);
    setSelectedShape(shape);
  }

  return <Box className="info-view">
    <Typography variant="h3" className="main-title">{t("stepper.info-title")}</Typography>
    <Typography variant="h2" className="main-title">{t("stepper.info-subtitle")}</Typography>

    <Grid container spacing={3} justifyContent="center" className="shape-grid">
      {SHAPES.map((shape) => (
        <Grid key={shape}>
          <Card
            className={`shape-card ${selectedShape === shape ? 'active' : ''}`}
          >
            <CardActionArea
              onClick={() => handleNext(shape)}
              className="card-area"
            >
              <Box className="card-content">
                <Typography variant="h6" color='black'>{shape}</Typography>
              </Box>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Box>
}