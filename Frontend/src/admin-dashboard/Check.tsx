import * as React from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

export default function AddressForm() {
  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        Tap your Beep Card
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            InputProps={{ disableUnderline: true }}
            id="UUID"
            name="UUID"
            label="UUID"
            fullWidth
            autoComplete="UUID"
            variant="standard"
          />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
