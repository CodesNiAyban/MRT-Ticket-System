import * as React from 'react';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Grid from '@mui/material/Grid';

const addresses = ['McKinley Rd', 'Makati', 'Metro Manila'];
const payments = [
  { name: 'Time', detail: '24-02-28 20:34:40' },
  { name: 'New Exp Date', detail: '01/04/2024' },
  { name: 'OldBal', detail: '₱47' },
  { name: 'Fee', detail: '₱25' },
  { name: 'NewBal', detail: '₱22' },
  { name: 'SlipNum', detail: '124186' },

];

export default function Review() {
  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        Tap-In Receipt
      </Typography>
      <List disablePadding>
        <ListItem sx={{ py: 1, px: 0 }}>
          <ListItemText primary="Total" />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            ₱25
          </Typography>
        </ListItem>
      </List>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Location
          </Typography>
          <Typography gutterBottom>AYALA STATION</Typography>
          <Typography gutterBottom>{addresses.join(', ')}</Typography>
          <Typography gutterBottom>to</Typography>
          <Typography gutterBottom>UN STATION</Typography>
          <Typography gutterBottom>{addresses.join(', ')}</Typography>
        </Grid>
        <Grid item container direction="column" xs={12} sm={6}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Payment details
          </Typography>
          <Grid container>
            {payments.map((payment) => (
              <React.Fragment key={payment.name}>
                <Grid item xs={6}>
                  <Typography gutterBottom>{payment.name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography gutterBottom>{payment.detail}</Typography>
                </Grid>
              </React.Fragment>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
