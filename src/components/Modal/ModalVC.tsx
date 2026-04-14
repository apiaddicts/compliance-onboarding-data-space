import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogActions, Button, Box, Snackbar} from '@mui/material';
import { JsonView } from '../JsonView/JsonView';
import { sendVcsToParent, vcToBase64 } from '@/utils/postMessage';
import './Modal.scss';

interface Props {
  open: boolean;
  handleClose: () => void;
  vc: {};
}

export const VerifiableCredentialStepperModal = ({ open, handleClose, vc }: Props) => {
  const { t } = useTranslation();

  const [jsonValue, setJsonValue] = useState(vc);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    setJsonValue(vc);
  }, [vc]);

  const handleSnackbar = (open: boolean) => {
    setOpenSnackbar(open);
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
    handleDownload(vc, 'participant');
    sendVcsToParent([vcToBase64(vc as Record<string, unknown>, 'participant.json')]);
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
      <Box className="vc-header"></Box>
      <DialogContent sx={{ p: 0 }}>
        <Box className="vc-code-container">
          <JsonView jsonValue={jsonValue} />
        </Box>
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
