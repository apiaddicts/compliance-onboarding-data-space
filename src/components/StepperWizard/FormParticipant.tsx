import { Box, Typography, Grid, TextField, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { InfoOutlined } from '@mui/icons-material';
import { ParticipantStepper } from '@/interfaces';
import './StepperWizard.scss';

interface ParticipantProp {
  participantForm: ParticipantStepper;
  setParticipantForm: (participantForm: ParticipantStepper) => void;
}

export const ParticipantForm = ({ participantForm, setParticipantForm }: ParticipantProp) => {
  const { t } = useTranslation();

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParticipantForm({
      ...participantForm,
      [name]: value
    });
  }

  return <form noValidate autoComplete="off">
    <Grid container spacing={2}>
      <Grid size={6}>
        <Box className="input-group">
          <Typography className="label">{t("stepper.legal-name")} <span>*</span></Typography>
          <TextField
            fullWidth
            className="custom-textfield with-icon"
            slotProps={{ input: {
              endAdornment: (<Tooltip title={t("tooltip.legal-name")}><InfoOutlined className="info-icon" /></Tooltip>)}
            }}
            name="legalName"
            placeholder={t("placeholder.legal-name")}
            value={participantForm.legalName}
            onChange={handleOnChange}
            required
          />
        </Box>
      </Grid>
      <Grid size={6}>
        <Box className="input-group">
          <Typography className="label">{t("stepper.legal-registration-number")} <span>*</span></Typography>
          <TextField
            fullWidth
            className="custom-textfield with-icon"
            slotProps={{ input: {
              endAdornment: (<Tooltip title={t("tooltip.legal-registration-number")}><InfoOutlined className="info-icon" /></Tooltip>)}
            }}
            name="legalRegistrationNumber"
            placeholder={t("placeholder.legal-registration-number")}
            value={participantForm.legalRegistrationNumber}
            onChange={handleOnChange}
            required
          />
        </Box>
      </Grid>
      <Grid size={6}>
        <Box className="input-group">
          <Typography className="label">{t("stepper.headquarter-address")} <span>*</span></Typography>
          <TextField
            fullWidth
            className="custom-textfield with-icon"
            slotProps={{ input: {
              endAdornment: (<Tooltip title={t("tooltip.headquarter-address")}><InfoOutlined className="info-icon" /></Tooltip>)}
            }}
            name="headquarterAddress"
            placeholder={t("placeholder.headquarter-address")}
            value={participantForm.headquarterAddress}
            onChange={handleOnChange}
            required
          />
        </Box>
      </Grid>
      <Grid size={6}>
        <Box className="input-group">
          <Typography className="label">{t("stepper.legal-address")} <span>*</span></Typography>
          <TextField
            fullWidth
            className="custom-textfield with-icon"
            slotProps={{ input: {
              endAdornment: (<Tooltip title={t("tooltip.legal-address")}><InfoOutlined className="info-icon" /></Tooltip>)}
            }}
            name="legalAddres"
            placeholder={t("placeholder.legal-address")}
            value={participantForm.legalAddres}
            onChange={handleOnChange}
            required
          />
        </Box>
      </Grid>
      <Grid size={6}>
        <Box className="input-group">
          <Typography className="label">{t("stepper.parent-organization")}</Typography>
          <TextField
            fullWidth
            className="custom-textfield with-icon"
            slotProps={{ input: {
              endAdornment: (<Tooltip title={t("tooltip.parent-organization")}><InfoOutlined className="info-icon" /></Tooltip>)}
            }}
            name="parentOrganization"
            placeholder={t("placeholder.parent-organization")}
            value={participantForm.parentOrganization}
            onChange={handleOnChange}
          />
        </Box>
      </Grid>
      <Grid size={6}>
        <Box className="input-group">
          <Typography className="label">{t("stepper.sub-organization")}</Typography>
          <TextField
            fullWidth
            className="custom-textfield with-icon"
            slotProps={{ input: {
              endAdornment: (<Tooltip title={t("tooltip.sub-organization")}><InfoOutlined className="info-icon" /></Tooltip>)}
            }}
            name="subOrganization"
            placeholder={t("placeholder.sub-organization")}
            value={participantForm.subOrganization}
            onChange={handleOnChange}
          />
        </Box>
      </Grid>
    </Grid>
  </form>
}