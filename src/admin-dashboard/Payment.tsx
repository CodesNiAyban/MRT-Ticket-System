import * as React from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';

export default function PaymentForm() {
  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        Topup Value
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            required
            id="value"
            label="Value"
            fullWidth
            autoComplete="Value"
            variant="standard"
          />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
