import { useTranslation } from "react-i18next";
import { useDispatch } from 'react-redux';
import { changeView } from '@/store/view/viewSlice';
import { Box, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import classes from './Home.module.scss';

export const HomePage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const hancleView = async (view: string) => {
    dispatch(changeView(view));
  }

  return <Box sx={{marginTop: 12}}>
    <Typography
      variant="h4"
      sx={{
        fontWeight: 800,
        color: 'black'
      }}
    >
      {t("common.home-title")}
    </Typography>

    <Typography
      variant="subtitle2"
      sx={{ color: 'black',
        mb: 2
      }}
    >
      {t("common.home-subtitle")}
    </Typography>

    <Box className={classes["selection-cards-container"]}>
      <Box className={`${classes["credential-card"]}`}
        onClick={() => hancleView('PARTICIPANT')}
      >
        <Box className={classes["info-badge"]}>
          <InfoOutlinedIcon fontSize="inherit" />
        </Box>
        <Box className={classes["icon-box"]}>
          <PersonIcon />
        </Box>
        <Typography className={classes["card-label"]}>
          {t("common.participant-btn")}
        </Typography>
      </Box>

      <Box className={classes["credential-card"]}
        onClick={() => hancleView('STEPPER')}
      >
        <Box className={classes["info-badge"]}>
          <InfoOutlinedIcon fontSize="inherit" />
        </Box>
        <Box className={classes["icon-box"]}>
          <PersonIcon />
        </Box>
        <Typography className={classes["card-label"]}>
          {t("common.stepper-btn")}
        </Typography>
      </Box>
    </Box>
  </Box>
}