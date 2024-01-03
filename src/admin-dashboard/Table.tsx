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
  TextField,
} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

const CrudTable = () => {
  const [data, setData] = useState([
    { id: 1, name: 'Item 1', description: 'Description 1' },
    { id: 2, name: 'Item 2', description: 'Description 2' },
  ]);

  const [newItem, setNewItem] = useState({ id: null, name: '', description: '' });

  const handleAddItem = () => {
    // if (newItem.name && newItem.description) {
    //   setData([...data, newItem]);
    //   setNewItem({ id: null, name: '', description: '' });
    // }
  };

  const handleDeleteItem = (id : number) => {
    setData(data.filter((item) => item.id !== id));
  };

  const handleEditItem = (id : number) => {
    const selectedItem = data.find((item) => item.id === id);
    //setNewItem(selectedItem);
  };

  const handleUpdateItem = () => {
    // const updatedData = data.map((item) =>
    //   item.id === newItem.id ? { ...newItem } : item
    // );
    // setData(updatedData);
    // setNewItem({ id: null, name: '', description: '' });
  };

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
          Edit Beep Cards
        </Typography>
        <div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>
                  <Button onClick={() => handleEditItem(item.id)} color="primary">
                    Edit
                  </Button>
                  <Button onClick={() => handleDeleteItem(item.id)} color="secondary">
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <div>
        <TextField
          label="Name"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
        />
        <TextField
          label="Description"
          value={newItem.description}
          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
        />
        {newItem.id === null ? (
          <Button onClick={handleAddItem} color="primary">
            Add Item
          </Button>
        ) : (
          <Button onClick={handleUpdateItem} color="primary">
            Update Item
          </Button>
        )}
      </div>
    </div>
      </Paper>
    </Container>
  </React.Fragment>
  </>
  );
};

export default CrudTable;
