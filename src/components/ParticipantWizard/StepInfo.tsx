import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const InfoView = () => {
  const { t } = useTranslation();

  return <>
    <Typography variant="h3" className="title">
      {t("participant.info-title")}
    </Typography>
    <Typography className="subtitle">
      {t("participant.info-desc")}
    </Typography>
  </>
}
