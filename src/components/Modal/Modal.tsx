import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogActions, Button, Box,
  Typography, ToggleButton, ToggleButtonGroup, Snackbar, Alert, CircularProgress
} from '@mui/material';
import { JsonView } from '../JsonView/JsonView';
import { sendVcsToParent, vcToBase64 } from '@/utils/postMessage';
import './Modal.scss';

interface Props {
  open: boolean;
  handleClose: () => void;
  vc1: {};
  vc2: {};
  vc3: {};
  complianceResult?: Record<string, any> | null;
  complianceError?: string[] | null;
}

export const VerifiableCredentialModal = ({ open, handleClose, vc1, vc2, vc3, complianceResult, complianceError }: Props) => {
  const { t } = useTranslation();

  const [value, setValue] = useState('parti');
  const [jsonValue, setJsonValue] = useState(vc1);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    setJsonValue(vc1);
  }, [vc1]);

  useEffect(() => {
    setJsonValue(vc2);
  }, [vc2]);

  useEffect(() => {
    setJsonValue(vc3);
  }, [vc3]);

  const handleSnackbar = (open: boolean) => {
    setOpenSnackbar(open);
  };

  const handleChange = (e: React.MouseEvent<HTMLElement>, newValue: string) => {
    e.preventDefault();
    setValue(newValue);
    if (newValue === 'parti') {
      setJsonValue(vc1);
    } else if (newValue === 'terms') {
      setJsonValue(vc2);
    } else if (newValue === 'lrn') {
      setJsonValue(vc3);
    } else if (newValue === 'compliance') {
      setJsonValue(complianceResult || {});
    } else {
      setJsonValue({});
    }
  };

  const handleDownload = (jsonValue: Record<string, any>, filename: string) => {
    const json = JSON.stringify(jsonValue, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const handleDownloads = () => {
    handleDownload(vc1, 'legalParticipant');
    handleDownload(vc2, 'gx-terms-and-cs');
    handleDownload(vc3, 'legalRegistrationNumber');
    if (complianceResult) {
      handleDownload(complianceResult, 'complianceCredential');
    }

    const files = [
      vcToBase64(vc1 as Record<string, unknown>, 'legalParticipant.json'),
      vcToBase64(vc2 as Record<string, unknown>, 'gx-terms-and-cs.json'),
      vcToBase64(vc3 as Record<string, unknown>, 'legalRegistrationNumber.json'),
    ];
    if (complianceResult) {
      files.push(vcToBase64(complianceResult as Record<string, unknown>, 'complianceCredential.json'));
    }
    sendVcsToParent(files);
  }

  const handleCopy = () => {
    const json = JSON.stringify(jsonValue, null, 2);
    navigator.clipboard.writeText(json)
      .then(() => handleSnackbar(true))
      .catch(err => console.error("Error al copiar:", err));
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { className: 'vc-modal-paper' } }}
    >
      <div className="vc-header">
        <Typography variant="h6" component="h2">
          {t("participant.modal-title")}
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
              color: "#FFFFFF",
              border: "1px solid rgba(255,255,255,0.3)",
              borderLeft: "none",
              fontSize: "14px",
              "&.Mui-selected": {
                background: "rgba(255, 255, 255,0.15)",
                color: "#FFFFFF",
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
          <ToggleButton value="lrn">legalRegistrationNumber</ToggleButton>
          <ToggleButton value="compliance">Compliance</ToggleButton>
        </ToggleButtonGroup>
      </div>

      <DialogContent sx={{ p: 0 }}>
        {value === 'compliance' ? (
          <Box className="vc-code-container">
            {!complianceResult && !complianceError && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
                <CircularProgress size={24} />
                <Typography>{t("participant.compliance-loading")}</Typography>
              </Box>
            )}
            {complianceError && (
              <Box sx={{ p: 2 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                  {t("participant.compliance-error")}
                </Alert>
                {complianceError.map((err) => (
                  <Typography key={err} sx={{ color: '#ff6b6b', fontSize: '0.85rem', mb: 0.5, fontFamily: 'monospace' }}>
                    {err}
                  </Typography>
                ))}
              </Box>
            )}
            {complianceResult && (
              <Box>
                <Alert severity="success" sx={{ m: 2 }}>
                  {t("participant.compliance-success")}
                  {complianceResult.expirationDate && (
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                      {t("participant.compliance-expires")}: {new Date(complianceResult.expirationDate).toLocaleDateString()}
                    </Typography>
                  )}
                </Alert>
                <JsonView jsonValue={complianceResult} />
              </Box>
            )}
          </Box>
        ) : (
          <Box className="vc-code-container">
            <JsonView jsonValue={jsonValue} />
          </Box>
        )}
      </DialogContent>

      <DialogActions className="vc-actions">
        <Button 
          variant="contained" 
          className="btn-green"
          onClick={handleDownloads}
        >
          {t("participant.download")}
        </Button>
        <Button 
          variant="contained" 
          className="btn-green"
          onClick={handleCopy}
        >
          {t("participant.copy-to-clipboard")}
        </Button>
      </DialogActions>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => handleSnackbar(false)}
        message={t("participant.copied")}
      />
    </Dialog>
  );
};
