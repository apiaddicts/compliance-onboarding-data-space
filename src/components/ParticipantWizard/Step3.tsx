import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { JsonView } from '../JsonView/JsonView';
import './ParticipantWizard.scss';

interface Step3Prop {
  legalParticipant: {};
  termsAndConditions: {};
}

export const Step3 = ( {legalParticipant, termsAndConditions}: Step3Prop ) => {
  const { t } = useTranslation();

  const [value, setValue] = useState('parti');
  const [jsonValue, setJsonValue] = useState(legalParticipant);

  const handleChange = (e: React.MouseEvent<HTMLElement>, newValue: string) => {
    e.preventDefault();
    setValue(newValue);
    if (newValue === 'parti') {
      setJsonValue(legalParticipant);
    } else if (newValue === 'terms') {
      setJsonValue(termsAndConditions);
    } else {
      setJsonValue({});
    }
  };

  return <Box
    sx={{
      borderRadius: '8px',
      overflow: 'hidden',
    }}
  >
    <Typography
      variant="h4"
    >
      {t("participant.legal-part-title")}
    </Typography>
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={handleChange}
      sx={{
        width: "100%",
        borderRadius: "8px",
        overflow: "hidden",
        ".MuiToggleButtonGroup-grouped": {
          flex: 1,
          textTransform: "none",
          color: "#00BCD4",
          border: "1px solid rgba(255,255,255,0.3)",
          borderLeft: "none",
          fontSize: "14px",
          "&.Mui-selected": {
            background: "rgba(0, 188, 212,0.15)",
            color: "#00BCD4",
            borderColor: "rgba(255,255,255,0.7)",
          },
        },
        ".MuiToggleButtonGroup-grouped:first-of-type": {
          borderLeft: "1px solid rgba(255,255,255,0.3)",
        },
      }}
    >
      <ToggleButton value="parti">LegalParticipant</ToggleButton>
      <ToggleButton value="terms">GaiaXTermsAndConditions</ToggleButton>
    </ToggleButtonGroup>
    <JsonView jsonValue={jsonValue} />
  </Box>
}