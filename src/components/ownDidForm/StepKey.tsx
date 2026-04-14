import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TextField, Box, Typography, Tooltip, Button, CircularProgress, Select, MenuItem } from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import { generateTemporaryKeys, exportPrivateKeyPEM, detectAlgorithmFromPEM } from '@/utils';
import type { KeyAlgorithm } from '@/utils/sign';
import './form.scss';

interface StepProps {
  privateKey: string;
  setPrivateKey: (privateKey: string) => void;
  signAlgorithm?: string;
  setSignAlgorithm?: (alg: string) => void;
}

export const StepKey = ({ privateKey, setPrivateKey, signAlgorithm, setSignAlgorithm }: StepProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [keyType, setKeyType] = useState<'ecdsa' | 'rsa' | 'unknown'>('unknown');
  const [algFromDidJson, setAlgFromDidJson] = useState(false);

  useEffect(() => {
    if (signAlgorithm && (signAlgorithm === 'RS256' || signAlgorithm === 'PS256' || signAlgorithm === 'ES256')) {
      setAlgFromDidJson(true);
    }
  }, []);

  useEffect(() => {
    if (!privateKey?.includes('BEGIN PRIVATE KEY')) {
      setKeyType('unknown');
      return;
    }
    try {
      const detected: KeyAlgorithm = detectAlgorithmFromPEM(privateKey);
      const isRsa = detected === 'RS256';
      setKeyType(isRsa ? 'rsa' : 'ecdsa');
      if (!algFromDidJson && setSignAlgorithm) {
        setSignAlgorithm(detected);
      }
    } catch {
      setKeyType('unknown');
    }
  }, [privateKey]);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setPrivateKey(value);
  }

  const generateKey = async () => {
    setLoading(true);
    const keyPair = await generateTemporaryKeys();
    const privateKey = await exportPrivateKeyPEM(keyPair);
    setPrivateKey(privateKey);
    setLoading(false);
  }

  return (
    <Box className="form-container">
      <form noValidate autoComplete="off">
        <Box className="input-group">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              mb: 1
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography className="label"
                sx={{ fontWeight: 'bold', mr: 0.5 }}
              >
                {t("common.private-key")}
              </Typography>
              <Tooltip title={t("tooltip.private-key")}><InfoOutlined className="info-icon" /></Tooltip>
            </Box>
            <Button
              onClick={generateKey}
              disabled={loading}
              variant="text"
              size="small"
            >
              {loading ? <CircularProgress size={24}/> : t("common.generate")}
            </Button>
          </Box>
          <TextField
            fullWidth
            variant="outlined"
            className="custom-textfield"
            id="outlined-multiline-static"
            placeholder={t("placeholder.private-key")}
            multiline
            rows={4}
            value={privateKey}
            onChange={handleOnChange}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
            <Typography className="label" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
              {t("common.sign-algorithm")}
            </Typography>
            <Select
              size="small"
              sx={{ minWidth: 220 }}
              value={signAlgorithm || 'ES256'}
              onChange={(e) => setSignAlgorithm?.(e.target.value)}
              disabled={keyType !== 'rsa' || algFromDidJson}
            >
              {keyType === 'rsa' ? [
                <MenuItem key="RS256" value="RS256">RS256 (RSA PKCS#1)</MenuItem>,
                <MenuItem key="PS256" value="PS256">PS256 (RSA-PSS)</MenuItem>
              ] : [
                <MenuItem key="ES256" value="ES256">ES256 (ECDSA)</MenuItem>,
                <MenuItem key="RS256" value="RS256">RS256 (RSA PKCS#1)</MenuItem>,
                <MenuItem key="PS256" value="PS256">PS256 (RSA-PSS)</MenuItem>
              ]}
            </Select>
          </Box>
        </Box>
      </form>
    </Box>
  );
}