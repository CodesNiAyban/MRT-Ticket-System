import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import DirectionsSubwayIcon from '@mui/icons-material/DirectionsSubway';
import LogoutIcon from '@mui/icons-material/Logout';
import ReceiptIcon from '@mui/icons-material/Receipt';
import {Link} from 'react-router-dom';


export const mainListItems = (
  <React.Fragment>
    <ListItemButton>
      <ListItemIcon>
        <DirectionsSubwayIcon />
      </ListItemIcon>
      <ListItemText primary="Fare and Stations" />
    </ListItemButton>

    <ListItemButton
      key={"Load"}
      component={Link}
      to={"\Load"}
    >
      <ListItemIcon>
        <CreditCardIcon />
      </ListItemIcon>
      <ListItemText primary="Beep Cards" />
    </ListItemButton>

    <ListItemButton
      key={"TransactionLogs"}
      component={Link}
      to={"\TransactionLogs"}
    >
      <ListItemIcon>
        <ReceiptIcon />
      </ListItemIcon>
      <ListItemText primary="Transaction Logs" />
    </ListItemButton>
  </React.Fragment>
);

export const secondaryListItems = (
  <React.Fragment>
    <ListItemButton
     key={".\AdminLogin"}
     component={Link}
     to={"..\AdminLogin"}
    >
      <ListItemIcon>
        <LogoutIcon />
      </ListItemIcon>
      <ListItemText primary="Logout" />
    </ListItemButton>
  </React.Fragment>
);