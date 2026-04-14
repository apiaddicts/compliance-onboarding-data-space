import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import LanguageSelector from '../LanguageSelector/LanguageSelector';
import { Box, Select, MenuItem, FormControl, Button, Typography } from '@mui/material';
import { ArrowBackIosNew } from '@mui/icons-material';
import { ENVIRONMENTS, VERSIONS, VIEWS } from '@/utils';
import { changeView } from '@/store/view/viewSlice';
import type { RootState } from '@/store';
const LogoSvg = '/Logo.svg';

const PRIMARYCOLOR = "#00BCD4";
const PILL_HEIGHT = 72;

const SelectGroup = ({ environment, setEnvironment, version, setVersion, t }: any) => (
  <>
    <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
      {t("common.environment")}
    </Typography>
    <FormControl
      variant="outlined"
      size="small"
      sx={{
        backgroundColor: 'white',
        borderRadius: '12px',
        minWidth: 100,
        "& .MuiOutlinedInput-notchedOutline": { border: 0 },
      }}
    >
      <Select
        value={environment}
        onChange={(e: any) => setEnvironment(e.target.value)}
        sx={{ color: PRIMARYCOLOR }}
      >
        {ENVIRONMENTS.map((env: string) => (
          <MenuItem key={env} value={env}>{env}</MenuItem>
        ))}
      </Select>
    </FormControl>

    <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
      {t("common.version")}
    </Typography>
    <FormControl
      variant="outlined"
      size="small"
      sx={{
        backgroundColor: 'white',
        borderRadius: '12px',
        minWidth: 100,
        "& .MuiOutlinedInput-notchedOutline": { border: 0 },
      }}
    >
      <Select
        value={version}
        onChange={(e: any) => setVersion(e.target.value)}
        sx={{ color: PRIMARYCOLOR }}
      >
        {VERSIONS.map((ver: string) => (
          <MenuItem key={ver} value={ver}>{ver}</MenuItem>
        ))}
      </Select>
    </FormControl>
  </>
);

const NavBar = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { view } = useSelector((state: RootState) => state.view);

  const [environment, setEnvironment] = useState('Any');
  const [version, setVersion] = useState('v1 (Tagus)');

  const handleView = (view: string) => {
    dispatch(changeView(view));
  }

  const selectProps = { environment, setEnvironment, version, setVersion, t };

  return (
    <div style={{ position: 'absolute', top: 0, width: '100%', zIndex: 100 }}>
      <header style={{ padding: '1rem 1.5rem' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Row 1: Back + Pill + Language */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>

            {view !== VIEWS.HOME && (
              <Button
                title={t("common.back")}
                onClick={() => handleView('HOME')}
                startIcon={<ArrowBackIosNew />}
                style={{
                  textTransform: 'none',
                  backgroundColor: PRIMARYCOLOR,
                  color: '#FFF',
                  border: 'none',
                  borderRadius: 36,
                  height: PILL_HEIGHT,
                  paddingLeft: 20,
                  paddingRight: 20,
                  boxShadow: 'none',
                  flexShrink: 0,
                }}
              >
                {t("common.back")}
              </Button>
            )}

            <Box
              sx={{
                backgroundColor: PRIMARYCOLOR,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flex: 1,
                minWidth: 0,
                borderRadius: 36,
                height: PILL_HEIGHT,
                paddingX: '24px',
                marginX: '12px',
              }}
            >
              {/* Logo + Title */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <img src={LogoSvg} alt="Logo" style={{ height: 36, flexShrink: 0 }} />
                <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Gaia-X Credentials Generator
                </Typography>
              </Box>

              {/* Selects inside pill — only on md+ */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: '12px', alignItems: 'center' }}>
                <SelectGroup {...selectProps} />
              </Box>
            </Box>

            <LanguageSelector />
          </Box>

          {/* Row 2: Selects in small pill — only on xs/sm */}
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              backgroundColor: PRIMARYCOLOR,
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
              gap: '12px',
              borderRadius: 24,
              height: 44,
              paddingX: '20px',
            }}
          >
            <SelectGroup {...selectProps} />
          </Box>
        </Box>
      </header>
    </div>
  );
}

export default NavBar;
