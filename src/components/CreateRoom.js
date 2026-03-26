import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import FormControl from '@mui/material/FormControl';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { createRoom } from '../services/api';
import toastr from 'toastr';

function CreateRoom() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creator, setCreator] = useState('');

  const createRoomOnClick = (event) => {
    event.preventDefault();
    createRoom(title, description, creator)
      .then(data => {
        if (data) {
          localStorage.setItem("accessToken", data.creator.access_token);
          localStorage.setItem("userUid", data.creator.uid);
          navigate("/rooms/" + data.uid);
        } else {
          toastr.error("Something went wrong!");
        }
      })
      .catch(error => console.log(error));
  };

  return (
    <Box sx={{ width: { xs: 'auto', sm: 400 }, mx: 'auto' }}>
      <CssBaseline />
      <Paper sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', p: '16px 24px 24px' }}>
        <Typography component="h1" variant="h5">
          Create A New Room
        </Typography>
        <Box component="form" sx={{ width: '100%', mt: 1 }}>
          <FormControl margin="normal" required fullWidth>
            <InputLabel htmlFor="title">Room Title</InputLabel>
            <Input id="title" name="title" autoFocus
              value={title} onChange={e => setTitle(e.target.value)} />
          </FormControl>
          <FormControl margin="normal" fullWidth>
            <InputLabel htmlFor="description">Room Description</InputLabel>
            <Input name="description" id="description"
              value={description} onChange={e => setDescription(e.target.value)} />
          </FormControl>
          <FormControl margin="normal" required fullWidth>
            <InputLabel htmlFor="creator">Creator Name</InputLabel>
            <Input name="creator" id="creator"
              value={creator} onChange={e => setCreator(e.target.value)} />
          </FormControl>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="secondary"
            sx={{ mt: 3 }}
            onClick={createRoomOnClick}
          >
            Create
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default CreateRoom;
