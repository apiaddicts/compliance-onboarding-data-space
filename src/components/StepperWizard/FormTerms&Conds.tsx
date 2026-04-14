import { Checkbox, FormGroup, FormControlLabel, Typography, Box, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { InfoOutlined } from '@mui/icons-material';
import './StepperWizard.scss';

interface Props {
  acceptTerms: boolean;
  setAcceptTerms: (acceptTerms: boolean) => void;
}

export const TermsAndConditionsForm = ({ acceptTerms, setAcceptTerms }: Props) => {
  const { t } = useTranslation();

  return <form noValidate autoComplete="off">
    <Typography sx={{ fontWeight: 600, fontSize: '1.1rem', mb: 2 }}>{t("participant.terms-title")}</Typography>
    <Typography className="description" sx={{ mb: 3, lineHeight: 1.7 }}>
      {t("participant.terms-text")}
    </Typography>
    <FormGroup sx={{ mt: 2 }}>
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
  </form>
}