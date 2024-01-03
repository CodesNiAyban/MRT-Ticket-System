import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

const TransactionLogs = () => {
  const [logs, setLogs] = useState([
    { id: 1, timestamp: '2022-01-01 10:00 AM', description: 'Deposit', amount: 1000 },
    { id: 2, timestamp: '2022-01-02 2:30 PM', description: 'Withdrawal', amount: -500 },
    // Add more sample data as needed
  ]);

  return (

<> <React.Fragment>
<CssBaseline />
<AppBar
  position="absolute"
  color="default"
  elevation={0}
  sx={{
    position: 'relative',
    borderBottom: (t) => `1px solid ${t.palette.divider}`,
  }}
>
  <Toolbar>
    <Typography variant="h6" color="inherit" noWrap>
    </Typography>
  </Toolbar>
</AppBar>
<Container component="main" maxWidth="sm" sx={{ mb: 4 }}>
  <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
    <Typography component="h1" variant="h4" align="center">
      Transaction Logs
    </Typography>
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Timestamp</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Amount</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>{log.id}</TableCell>
              <TableCell>{log.timestamp}</TableCell>
              <TableCell>{log.description}</TableCell>
              <TableCell>{log.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Paper>
</Container>
</React.Fragment>
</>
  );
};

export default TransactionLogs;