import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@mui/material';
import { JsonView } from '../JsonView/JsonView';

interface Props {
  jsonValue: {};
}

export const SignStep = ({ jsonValue }: Props) => {
  const { t } = useTranslation();

  return <Box
    sx={{
      borderRadius: '8px',
      overflow: 'hidden',
    }}
  >
    <Typography
      variant="h4"
    >
      {t("stepper.sign-title")}
    </Typography>
    <JsonView jsonValue={jsonValue} />
  </Box>
}