import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextField, Radio, RadioGroup, FormControlLabel, CircularProgress,
  Grid, Box, Typography, Alert, Button, Tooltip, Switch } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import { getJsonFile } from '@/apis/signApi';
import { LegalParticipantInterface, ValidationResult, Options } from '@/interfaces';
import './ParticipantWizard.scss';

interface Step1Prop {
  legalPartForm: LegalParticipantInterface;
  setLegalPartForm: (legalPartForm: LegalParticipantInterface) => void;
  useUrl: boolean;
  setUseUrl: (useUrl: boolean) => void;
  errorManager: {
    show: boolean;
    message: string;
  };
  setErrorManager: (errorManager: { show: boolean; message: string }) => void;
  setOpenSnack: (open: boolean) => void;
  setTypeSnack: (type: "success" | "error") => void;
  setMsgs: (msgs: string) => void;
  setDownload: (value: boolean) => void;
  isImportMode: boolean;
  setIsImportMode: (isImportMode: boolean) => void;
}

const lrnTypes = ['vatID', 'taxID', 'EUID', 'EORI', 'leiCode'];

export const Step1 = ({ legalPartForm, setLegalPartForm, useUrl, setUseUrl, errorManager, setErrorManager, setOpenSnack, setTypeSnack, setMsgs, setDownload, isImportMode, setIsImportMode }: Step1Prop) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const getLrnPlaceholder = () => {
    switch (legalPartForm.legalRegistrationNumberType) {
      case 'vatID':
        return t("placeholder.lrn-vatid");
      case 'taxID':
        return t("placeholder.lrn-taxid");
      case 'EUID':
        return t("placeholder.lrn-euid");
      case 'EORI':
        return t("placeholder.lrn-eori");
      case 'leiCode':
        return t("placeholder.lrn-leicode");
      default:
        return t("placeholder.legal-registration-number");
    }
  }

  const isValidParticipantJsonUrl = (input: string, opts: Options = {} ): ValidationResult => {
    const {
      allowRelative = false,
      base = (typeof window !== 'undefined' && window.location)
        ? window.location.origin
        : 'http://localhost'
    } = opts;

    if (typeof input !== 'string' || input.trim() === '') {
      return { ok: false, reason: t("participant.errors.step1.entry-empty") };
    }

    let url: URL;
    try {
      url = allowRelative ? new URL(input, base) : new URL(input);
    } catch {
      return { ok: false, reason: t("participant.errors.step1.invalid-url") };
    }

    if (!/^https?:$/.test(url.protocol)) {
      return { ok: false, reason: t("participant.errors.step1.invalid-scheme") };
    }

    const pathname = url.pathname;
    if (!pathname.toLowerCase().endsWith('/participant.json')) {
      return { ok: false, reason: t("participant.errors.step1.invalid-path") };
    }

    return { ok: true, url };
  }

  const isValidParticipantJson = (data: any): ValidationResult => {
    const dataJson = typeof data === 'string' ? JSON.parse(data) : data;

    if (typeof dataJson !== 'object' || dataJson === null) {
      return { ok: false, reason: t("participant.errors.step1.invalid-json") };
    }
    if (!dataJson["@context"] || !Array.isArray(dataJson["@context"])) {
      return { ok: false, reason: t("participant.errors.step1.missing-field", { field: "@context" }) };
    }
    if (!dataJson["type"] || !Array.isArray(dataJson["type"])) {
      return { ok: false, reason: t("participant.errors.step1.missing-field", { field: "type" }) };
    }
    if (!dataJson["id"] || typeof dataJson["id"] !== 'string') {
      return { ok: false, reason: t("participant.errors.step1.missing-field", { field: "id" }) };
    }
    if (!dataJson["issuer"] || typeof dataJson["issuer"] !== 'string') {
      return { ok: false, reason: t("participant.errors.step1.missing-field", { field: "issuer" }) };
    }
    if (!dataJson["credentialSubject"]) {
      return { ok: false, reason: t("participant.errors.step1.missing-field", { field: "credentialSubject" }) };
    }
    if (!dataJson["credentialSubject"]["gx:legalName"] || typeof dataJson["credentialSubject"]["gx:legalName"] !== 'string') {
      return { ok: false, reason: t("participant.errors.step1.missing-field", { field: "gx:legalName" }) };
    }
    if (!dataJson["credentialSubject"]["gx:legalRegistrationNumber"] || typeof dataJson["credentialSubject"]["gx:legalRegistrationNumber"] !== 'object') {
      return { ok: false, reason: t("participant.errors.step1.missing-field", { field: "gx:legalRegistrationNumber" }) };
    }
    if (!dataJson["credentialSubject"]["gx:legalRegistrationNumber"]["id"] || typeof dataJson["credentialSubject"]["gx:legalRegistrationNumber"]["id"] !== 'string') {
      return { ok: false, reason: t("participant.errors.step1.missing-field", { field: "gx:legalRegistrationNumber.id" }) };
    }
    if (!dataJson["credentialSubject"]["gx:headquarterAddress"] || typeof dataJson["credentialSubject"]["gx:headquarterAddress"] !== 'object') {
      return { ok: false, reason: t("participant.errors.step1.missing-field", { field: "gx:headquarterAddress" }) };
    }
    if (!dataJson["credentialSubject"]["gx:headquarterAddress"]["gx:countrySubdivisionCode"] || typeof dataJson["credentialSubject"]["gx:headquarterAddress"]["gx:countrySubdivisionCode"] !== 'string') {
      return { ok: false, reason: t("participant.errors.step1.missing-field", { field: "gx:headquarterAddress.gx:countrySubdivisionCode" }) };
    }
    if (!dataJson["credentialSubject"]["gx:legalAddress"] || typeof dataJson["credentialSubject"]["gx:legalAddress"] !== 'object') {
      return { ok: false, reason: t("participant.errors.step1.missing-field", { field: "gx:legalAddress" }) };
    }
    if (!dataJson["credentialSubject"]["gx:legalAddress"]["gx:countrySubdivisionCode"] || typeof dataJson["credentialSubject"]["gx:legalAddress"]["gx:countrySubdivisionCode"] !== 'string') {
      return { ok: false, reason: t("participant.errors.step1.missing-field", { field: "gx:legalAddress.gx:countrySubdivisionCode" }) };
    }
    return { ok: true, data: dataJson };
  }

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLegalPartForm({
      ...legalPartForm,
      [name]: value
    });
    setUseUrl(true);
  }

  const handleImport = async () => {
    setErrorManager({ show: false, message: '' });
    if (!legalPartForm.url || legalPartForm.url.trim() === '') {
      setErrorManager({ show: true, message: t("participant.errors.step1.entry-empty") });
      setTypeSnack('error');
      setMsgs(t("participant.errors.step1.entry-empty"));
      setOpenSnack(true);
      return;
    }
    const validation = isValidParticipantJsonUrl(legalPartForm.url);
    if (!validation.ok) {
      errorManager.show = true;
      errorManager.message = validation.reason;
      setErrorManager({ ...errorManager });
      return;
    }
    try {
      setLoading(true);
      const res = await getJsonFile(legalPartForm.url);
      const content = res.data;
      const contentValidation = isValidParticipantJson(content);
      if (!contentValidation.ok) {
        errorManager.show = true;
        errorManager.message = contentValidation.reason;
        setErrorManager({ ...errorManager });
        return;
      }
      if ('data' in contentValidation) {
        const dataJson = contentValidation.data;
        let legalParticipant_ = {
          legalName: dataJson.credentialSubject["gx:legalName"] || '',
          legalRegistrationNumber: dataJson.credentialSubject ["gx:legalRegistrationNumber"]?.["id"] || '',
          legalRegistrationNumberType: 'vatID',
          headquarterAddress: dataJson.credentialSubject["gx:headquarterAddress"]?.["gx:countrySubdivisionCode"] || '',
          legalAddress: dataJson.credentialSubject["gx:legalAddress"]?.["gx:countrySubdivisionCode"] || '',
          url: legalPartForm.url || '',
          lrnVerifiableCId: '',
          lrnCSubjectId: '',
          parentOrganization: '',
          subOrganization: ''
        }
        setDownload(true);
        setLegalPartForm(legalParticipant_);
        setTypeSnack('success');
        setMsgs(t("participant.valid-file"));
      }
    } catch (error) {
      console.error("Error fetching JSON file:", error);
      errorManager.show = true;
      errorManager.message = t("participant.errors.step1.something-went-wrong");
      setTypeSnack('error');
      setMsgs(errorManager.message);
      setErrorManager({ ...errorManager });
    } finally {
      setOpenSnack(true);
      setLoading(false);
    }
  }

  return (
    <Box className="form-container">
      {errorManager.show && <Alert severity="error">{errorManager.message}</Alert>}
        <Box sx={{
          backgroundColor: 'action.hover',
          p: 2,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3
        }}>
          <Typography variant="body1">
            {t("participant.has-file")}
            <Box component="span" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.875rem' }}>
              {t("participant.activate-option")}
            </Box>
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={isImportMode}
                onChange={(e) => setIsImportMode(e.target.checked)}
              />
            }
            label={isImportMode ? t("participant.import") : t("participant.generate-new")}
            labelPlacement="start"
          />
        </Box>
        {isImportMode ?
          <form>
            <Box className="input-group">
              <Typography className="label">{t("participant.url-participant")}</Typography>
              <TextField
                fullWidth
                variant="outlined"
                className="custom-textfield"
                name="url"
                placeholder={t("placeholder.url-participant")}
                slotProps={{ input: {
                  endAdornment: (<Tooltip title={t("tooltip.input-url")}><InfoOutlined className="info-icon" /></Tooltip>)}
                }}
                value={legalPartForm.url}
                onChange={handleOnChange}
                required
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={handleImport}
                sx={{
                  borderRadius: '50px',
                  padding: '10px 28px',
                  textTransform: 'none',
                  fontWeight: 700,
                }}
              >
                {loading ? <CircularProgress sx={{ color: '#ffffff' }} size={24} /> : t("participant.import")}
              </Button>
            </Box>
          </form>
        : 
          <form>
            <Box className="input-group">
              <Typography className="label">{t("participant.legal-name")} <span>*</span></Typography>
              <TextField
                fullWidth
                variant="outlined"
                className="custom-textfield"
                name="legalName"
                placeholder={t("placeholder.legal-name")}
                value={legalPartForm.legalName}
                onChange={handleOnChange}
                slotProps={{ input: {
                  endAdornment: (<Tooltip title={t("tooltip.legal-name")}><InfoOutlined className="info-icon" /></Tooltip>)}
                }}
                required
              />
            </Box>

            <Box className="input-group">
              <Typography className="label">{t("participant.legal-registration-number")} <span>*</span></Typography>
              <RadioGroup
                row
                value={legalPartForm.legalRegistrationNumberType}
                onChange={e => handleOnChange(e)}
                sx={{
                  '&.MuiFormControlLabel-label': {
                    color: 'black',
                  },
                }}
                name="legalRegistrationNumberType"
              >
                {lrnTypes.map((id) => (
                  <FormControlLabel
                    key={id}
                    value={id}
                    control={<Radio size="small" sx={{ color: 'black' }} />} 
                    label={id}
                  />
                ))}
              </RadioGroup>
              <TextField
                fullWidth
                variant="outlined"
                className="custom-textfield"
                name='legalRegistrationNumber'
                placeholder={getLrnPlaceholder()}
                value={legalPartForm.legalRegistrationNumber}
                onChange={handleOnChange}
                slotProps={{ input: {
                  endAdornment: (<Tooltip title={t("tooltip.legal-registration-number")}><InfoOutlined className="info-icon" /></Tooltip>)}
                }}
                required
              />
            </Box>

            <Grid container spacing={{xs: 1, md: 2}} alignItems="flex-end">
              <Grid size={{xs: 12, md: 6}}>
                <Box className="input-group">
                  <Typography className="label">{t("participant.headquarter-address")} <span>*</span></Typography>
                  <TextField
                    fullWidth
                    className="custom-textfield with-icon"
                    slotProps={{ input: {
                      endAdornment: (<Tooltip title={t("tooltip.headquarter-address")}><InfoOutlined className="info-icon" /></Tooltip>)}
                    }}
                    name="headquarterAddress"
                    placeholder={t("placeholder.headquarter-address")}
                    value={legalPartForm.headquarterAddress}
                    onChange={handleOnChange}
                    required
                  />
                </Box>
              </Grid>
              <Grid size={{xs: 12, md: 6}}>
                <Box className="input-group">
                  <Typography className="label">{t("participant.legal-address")} <span>*</span></Typography>
                  <TextField
                    fullWidth
                    className="custom-textfield with-icon"
                    slotProps={{ input: {
                      endAdornment: (<Tooltip title={t("tooltip.legal-address")}><InfoOutlined className="info-icon" /></Tooltip>)}
                    }}
                    name="legalAddress"
                    placeholder={t("placeholder.legal-address")}
                    value={legalPartForm.legalAddress}
                    onChange={handleOnChange}
                    required
                  />
                </Box>
              </Grid>
            </Grid>

            <Grid container spacing={{xs: 1, md: 2}}>
              <Grid size={{xs: 12, md: 6}}>
                <Box className="input-group">
                  <Typography className="label">{t("participant.parent-organization")}</Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    className="custom-textfield"
                    name="parentOrganization"
                    placeholder={t("placeholder.parent-organization")}
                    value={legalPartForm.parentOrganization}
                    slotProps={{ input: {
                      endAdornment: (<Tooltip title={t("tooltip.parent-organization")}><InfoOutlined className="info-icon" /></Tooltip>)}
                    }}
                    onChange={handleOnChange}
                  />
                </Box>
              </Grid>
              <Grid size={{xs: 12, md: 6}}>
                <Box className="input-group">
                  <Typography className="label">{t("participant.sub-organization")}</Typography>
                  <TextField
                    fullWidth
                    variant="outlined"
                    className="custom-textfield"
                    name="subOrganization"
                    placeholder={t("placeholder.sub-organization")}
                    value={legalPartForm.subOrganization}
                    slotProps={{ input: {
                      endAdornment: (<Tooltip title={t("tooltip.sub-organization")}><InfoOutlined className="info-icon" /></Tooltip>)}
                    }}
                    onChange={handleOnChange}
                  />
                </Box>
              </Grid>
            </Grid>
          </form>
        }
    </Box>
  );
}