import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, MenuItem, Button } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
const PRIMARYCOLOR = "#00BCD4";

function LanguageSelector() {
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (lang?: string) => {
    if (lang) i18n.changeLanguage(lang);
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        startIcon={<LanguageIcon />}
        onClick={handleClick}
        style={{
          textTransform: 'none',
          backgroundColor: PRIMARYCOLOR,
          color: '#FFF',
          border: 'none',
          borderRadius: 24,
          height: 72,
          paddingLeft: 16,
          paddingRight: 16,
        }}
      >
        {i18n.language === 'en' ? 'English' : 'Español'}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => handleClose()}
        slotProps={{
          paper: {
            style: {
              borderRadius: 12,
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            },
          },
        }}
      >
        <MenuItem onClick={() => handleClose('es')}>Spanish</MenuItem>
        <MenuItem onClick={() => handleClose('en')}>English</MenuItem>
      </Menu>
    </div>
  );
}

export default LanguageSelector;
