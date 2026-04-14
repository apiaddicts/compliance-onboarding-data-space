import { FormControlLabel, Box, Typography, FormGroup, Checkbox, Alert, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { InfoOutlined } from '@mui/icons-material';
import './ParticipantWizard.scss';

interface Step2Prop {
  acceptTerms: boolean;
  setAcceptTerms: (useOwnDid: boolean) => void;
  termsText: string;
  errorManager: {
    show: boolean;
    message: string;
  }
}

export const Step2 = ( {acceptTerms, setAcceptTerms, termsText, errorManager}: Step2Prop ) => {
  const { t } = useTranslation();

  return <Box className="form-container">
    {errorManager.show && <Alert severity="error">{errorManager.message}</Alert>}
    <Typography>{t("participant.terms-title")}</Typography>
    <Typography className="description">
      {termsText}
    </Typography>
    <FormGroup>
      <FormControlLabel
        control={<Checkbox />}
        label={
          <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            {t("participant.terms-checkbox")}
            <Tooltip title={t("tooltip.terms-checkbox")}><InfoOutlined sx={{ fontSize: '1rem', cursor: 'help' }} /></Tooltip>
          </Box>
        }
        onChange={(_, checked) => {setAcceptTerms(checked)}}
        value={acceptTerms}
      />
    </FormGroup>
  </Box>
}