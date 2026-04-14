import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextField, Grid, Box, Typography, FormControlLabel, Switch,
  CircularProgress, Button, Tooltip } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import { getJsonFile } from '@/apis/signApi';
import { IdentityInterface, ValidationResult, Options } from '@/interfaces';
import './form.scss';

interface StepProps {
  identity: IdentityInterface;
  setIdentity: (identity: IdentityInterface) => void;
  stepper?: boolean;
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

export const StepIdentity = ({ identity, setIdentity, stepper, isImportMode, setIsImportMode, errorManager, setErrorManager, setOpenSnack, setTypeSnack, setMsgs, setDownload }: StepProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const isValidDidJsonUrl = (input: string, opts: Options = {} ): ValidationResult => {
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
    if (!pathname.toLowerCase().endsWith('/did.json')) {
      return { ok: false, reason: t("participant.errors.step1.invalid-path-did") };
    }

    return { ok: true, url };
  }

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setErrorManager({ show: false, message: '' });
    setIdentity({
      ...identity,
      [name]: value.trim()
    });
  }

  const handleImport = async () => {
    setErrorManager({ show: false, message: '' });
    if (!identity.url) return;
    const validation = isValidDidJsonUrl(identity.url);
    if (!validation.ok) {
      setErrorManager({ show: true, message: validation.reason });
      return;
    }
    try {
      setLoading(true);
      const res = await getJsonFile(identity.url);
      const content = res.data;
      const alg = content.verificationMethod?.[0]?.publicKeyJwk?.alg || '';
      const vmId = content.verificationMethod?.[0]?.id || '';
      setIdentity({
        ...identity,
        documentName: content.id || 'DID',
        issuer: content.id || '',
        verificationMethod: vmId,
        verifiableCredentialID: '',
        credentialSubjectID: '',
        tAndCVDID: '',
        tAndCCSubjectId: '',
        signAlgorithm: alg
      });
      setDownload(true);
      setIsImportMode(true);
      setTypeSnack('success');
      setMsgs(t("participant.valid-file"));
    } catch (error) {
      setTypeSnack('error');
      setMsgs(t("participant.errors.invalid-file"));
      console.error("Error fetching JSON file:", error);
      setErrorManager({ ...errorManager });
    } finally {
      setOpenSnack(true);
      setLoading(false);
    }
  }

  return (
    <Box className="form-container">
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
          {t("participant.has-file-did")}
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
        <form noValidate autoComplete="off" onSubmit={(e) => { e.preventDefault(); handleImport(); }}>
          <Box className="input-group">
            <Typography className="label">{t("participant.url-did")}</Typography>
            <TextField
              fullWidth
              variant="outlined"
              className="custom-textfield"
              name="url"
              placeholder={t("placeholder.url-did")}
              slotProps={{ input: {
                endAdornment: (<Tooltip title={t("tooltip.input-url-did")}><InfoOutlined className="info-icon" /></Tooltip>)}
              }}
              value={identity.url}
              onChange={handleOnChange}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={handleImport}
            >
              {loading ? <CircularProgress sx={{ color: '#ffffff' }} size={24} /> : t("participant.import")}
            </Button>
          </Box>
        </form>
      :
        <form onSubmit={(e) => e.preventDefault()}>
          <Grid container spacing={{xs: 1, md: 2}} alignItems="flex-end">
            <Grid size={{xs: 12, md: 6}}>
              <Box className="input-group">
                <Typography className="label">{t("common.doc-name")} <span>*</span></Typography>
                <TextField
                  fullWidth
                  className="custom-textfield with-icon"
                  slotProps={{ input: {
                    endAdornment: (<Tooltip title={t("tooltip.doc-name")}><InfoOutlined className="info-icon" /></Tooltip>)}
                  }}
                  name="documentName"
                  placeholder={t("placeholder.doc-name")}
                  value={identity.documentName}
                  onChange={handleOnChange}
                  required
                />
              </Box>
            </Grid>
            <Grid size={{xs: 12, md: 6}}>
              <Box className="input-group">
                <Typography className="label">{t("common.issuer")} <span>*</span></Typography>
                <TextField
                  fullWidth
                  className="custom-textfield with-icon"
                  slotProps={{ input: {
                    endAdornment: (<Tooltip title={t("tooltip.issuer")}><InfoOutlined className="info-icon" /></Tooltip>)}
                  }}
                  name="issuer"
                  placeholder={t("placeholder.issuer")}
                  value={identity.issuer}
                  onChange={handleOnChange}
                  required
                />
              </Box>
            </Grid>
          </Grid>

          <Grid container spacing={{xs: 1, md: 2}}>
            <Grid size={{xs: 12, md: 6}}>
              <Box className="input-group">
                <Typography className="label">{t("common.verifiable-method")} <span>*</span></Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  className="custom-textfield"
                  slotProps={{ input: {
                    endAdornment: (<Tooltip title={t("tooltip.vd-method")}><InfoOutlined className="info-icon" /></Tooltip>)}
                  }}
                  name="verificationMethod"
                  placeholder={t("placeholder.vd-method")}
                  value={identity.verificationMethod}
                  onChange={handleOnChange}
                  required
                />
              </Box>
            </Grid>
            <Grid size={{xs: 12, md: 6}}>
              <Box className="input-group">
                <Typography className="label">{t("common.verifiable-credential")} <span>*</span></Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  className="custom-textfield"
                  slotProps={{ input: {
                    endAdornment: (<Tooltip title={t("tooltip.vd-id")}><InfoOutlined className="info-icon" /></Tooltip>)}
                  }}
                  name="verifiableCredentialID"
                  placeholder={t("placeholder.vd-id")}
                  value={identity.verifiableCredentialID}
                  onChange={handleOnChange}
                  required
                />
              </Box>
            </Grid>
          </Grid>

          <Grid container spacing={{xs: 1, md: 2}}>
            <Grid size={{xs: 12, md: 6}}>
              <Box className="input-group">
                <Typography className="label">{t("common.credential-subject")} <span>*</span></Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  className="custom-textfield"
                  slotProps={{ input: {
                    endAdornment: (<Tooltip title={t("tooltip.vd-subject")}><InfoOutlined className="info-icon" /></Tooltip>)}
                  }}
                  name="credentialSubjectID"
                  placeholder={t("placeholder.vd-subject")}
                  value={identity.credentialSubjectID}
                  onChange={handleOnChange}
                  required
                />
              </Box>
            </Grid>
            {!stepper &&
            <Grid size={{xs: 12, md: 6}}>
              <Box className="input-group">
                <Typography className="label">{t("common.terms-vc-id")} <span>*</span></Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  className="custom-textfield"
                  slotProps={{ input: {
                    endAdornment: (<Tooltip title={t("tooltip.terms-id")}><InfoOutlined className="info-icon" /></Tooltip>)}
                  }}
                  name="tAndCVDID"
                  placeholder={t("placeholder.terms-id")}
                  value={identity.tAndCVDID}
                  onChange={handleOnChange}
                  required
                />
              </Box>
            </Grid>
            }
          </Grid>

          {!stepper &&
          <Grid container spacing={{xs: 1, md: 2}}>
            <Grid size={{xs: 12, md: 6}}>
              <Box className="input-group">
                <Typography className="label">{t("common.terms-c-subject")} <span>*</span></Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  className="custom-textfield"
                  slotProps={{ input: {
                    endAdornment: (<Tooltip title={t("tooltip.terms-subject")}><InfoOutlined className="info-icon" /></Tooltip>)}
                  }}
                  name="tAndCCSubjectId"
                  placeholder={t("placeholder.terms-subject")}
                  value={identity.tAndCCSubjectId}
                  onChange={handleOnChange}
                  required
                />
              </Box>
            </Grid>
          </Grid>
          }
        </form>
      }
    </Box>
  );
}