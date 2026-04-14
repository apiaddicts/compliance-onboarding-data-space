import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Select, MenuItem, Grid, TextField, Tooltip } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import { SelectChangeEvent } from '@mui/material/Select';
import { ServiceStepper } from '@/interfaces';
import './StepperWizard.scss';
import { REQUEST_TYPE, ACCESS_TYPE, DATA_REGIME } from '@/utils';

interface ServiceProp {
  serviceForm: ServiceStepper;
  setServiceForm: (serviceForm: ServiceStepper) => void;
}

export const ServiceOfferingForm = ({ serviceForm, setServiceForm }: ServiceProp) => {
  const { t } = useTranslation();

  const [requestType, setRequestType] = useState(REQUEST_TYPE[0]);
  const [accessType, setAccessType] = useState(ACCESS_TYPE[0]);
  const [dataRegime, setDataRegime] = useState(DATA_REGIME[0]);

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;
    setServiceForm({
      ...serviceForm,
      [name]: value
    });
  }

  return <form noValidate autoComplete="off">
    <Grid container spacing={2}>
      <Grid size={6}>
        <Box className="input-group">
          <Typography className="label">{t("stepper.provided-by")} <span>*</span></Typography>
          <TextField
            fullWidth
            className="custom-textfield with-icon"
            slotProps={{ input: {
              endAdornment: (<Tooltip title={t("tooltip.provided-by")}><InfoOutlined className="info-icon" /></Tooltip>)}
            }}
            name="providedBy"
            placeholder={t("placeholder.provided-by")}
            value={serviceForm.providedBy}
            onChange={handleFieldChange}
            required
          />
        </Box>
      </Grid>
      <Grid size={6}>
        <Box className="input-group">
          <Typography className="label">{t("stepper.policy")} <span>*</span></Typography>
          <TextField
            fullWidth
            className="custom-textfield with-icon"
            slotProps={{ input: {
              endAdornment: (<Tooltip title={t("tooltip.policy")}><InfoOutlined className="info-icon" /></Tooltip>)}
            }}
            name="policy"
            placeholder={t("placeholder.policy")}
            value={serviceForm.policy}
            onChange={handleFieldChange}
            required
          />
        </Box>
      </Grid>
      <Grid size={6}>
        <Box className="input-group">
          <Typography className="label">{t("stepper.terms-url")} <span>*</span></Typography>
          <TextField
            fullWidth
            className="custom-textfield with-icon"
            slotProps={{ input: {
              endAdornment: (<Tooltip title={t("tooltip.terms-url")}><InfoOutlined className="info-icon" /></Tooltip>)}
            }}
            name="termsAndConditionsUrl"
            placeholder={t("placeholder.terms-url")}
            value={serviceForm.termsAndConditionsUrl}
            onChange={handleFieldChange}
            required
          />
        </Box>
      </Grid>
      <Grid size={6}>
        <Box className="input-group">
          <Typography className="label">{t("stepper.terms-hash")} <span>*</span></Typography>
          <TextField
            fullWidth
            className="custom-textfield with-icon"
            slotProps={{ input: {
              endAdornment: (<Tooltip title={t("tooltip.terms-hash")}><InfoOutlined className="info-icon" /></Tooltip>)}
            }}
            name="termsAndConditionsHash"
            placeholder={t("placeholder.terms-hash")}
            value={serviceForm.termsAndConditionsHash}
            onChange={handleFieldChange}
            required
          />
        </Box>
      </Grid>
      <Grid size={6}>
        <Box className="input-group">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography className="label">{t("stepper.request-type")} <span>*</span></Typography>
            <Tooltip title={t("tooltip.request-type")}><InfoOutlined className="info-icon" /></Tooltip>)
          </Box>
          <Select
            fullWidth
            label={t("stepper.request-type")}
            value={requestType}
            className='custom-select'
            name="requestType"
            onChange={e => {setRequestType(e.target.value); handleFieldChange(e);}}
            required
          >
            {REQUEST_TYPE.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
          </Select>
        </Box>
      </Grid>
      <Grid size={6}>
        <Box className="input-group">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography className="label">{t("stepper.access-type")} <span>*</span></Typography>
            <Tooltip title={t("tooltip.access-type")}><InfoOutlined className="info-icon" /></Tooltip>)
          </Box>
          <Select
            fullWidth
            label={t("stepper.access-type")}
            value={accessType}
            className='custom-select'
            name="accessType"
            onChange={e => {setAccessType(e.target.value); handleFieldChange(e);}}
            required
          >
            {ACCESS_TYPE.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
          </Select>
        </Box>
      </Grid>
      <Grid size={6}>
        <Box className="input-group">
          <Typography className="label">{t("stepper.format-type")} <span>*</span></Typography>
          <TextField
            fullWidth
            className="custom-textfield with-icon"
            slotProps={{ input: {
              endAdornment: (<Tooltip title={t("tooltip.format-type")}><InfoOutlined className="info-icon" /></Tooltip>)}
            }}
            name="formatType"
            placeholder={t("placeholder.format-type")}
            value={serviceForm.formatType}
            onChange={handleFieldChange}
            required
          />
        </Box>
      </Grid>
      <Grid size={6}>
        <Box className="input-group">
          <Typography className="label">{t("stepper.aggregation-of")}</Typography>
          <TextField
            fullWidth
            className="custom-textfield with-icon"
            slotProps={{ input: {
              endAdornment: (<Tooltip title={t("tooltip.aggregation-of")}><InfoOutlined className="info-icon" /></Tooltip>)}
            }}
            name="aggregationOf"
            placeholder={t("placeholder.aggregation-of")}
            value={serviceForm.aggregationOf}
            onChange={handleFieldChange}
          />
        </Box>
      </Grid>
      <Grid size={6}>
        <Box className="input-group">
          <Typography className="label">{t("stepper.depends-on")}</Typography>
          <TextField
            fullWidth
            className="custom-textfield with-icon"
            slotProps={{ input: {
              endAdornment: (<Tooltip title={t("tooltip.depends-on")}><InfoOutlined className="info-icon" /></Tooltip>)}
            }}
            name="dependsOf"
            placeholder={t("placeholder.depends-on")}
            value={serviceForm.dependsOf}
            onChange={handleFieldChange}
          />
        </Box>
      </Grid>
      <Grid size={6}>
        <Box className="input-group">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography className="label">{t("stepper.data-regime")}</Typography>
            <Tooltip title={t("tooltip.data-regime")}><InfoOutlined className="info-icon" /></Tooltip>)
          </Box>
          <Select
            fullWidth
            label={t("stepper.data-regime")}
            value={dataRegime}
            className='custom-select'
            name="dataProtectionRegime"
            onChange={e => {setDataRegime(e.target.value); handleFieldChange(e);}}
          >
            {DATA_REGIME.map(regime => <MenuItem key={regime} value={regime}>{regime}</MenuItem>)}
          </Select>
        </Box>
      </Grid>
    </Grid>
  </form>
}