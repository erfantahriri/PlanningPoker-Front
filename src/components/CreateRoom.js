import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { createRoom } from '../services/api';
import toastr from 'toastr';

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: 'rgba(148,163,184,0.2)' },
    '&:hover fieldset': { borderColor: 'rgba(99,102,241,0.5)' },
    '&.Mui-focused fieldset': { borderColor: '#6366f1' },
  },
};

function CreateRoom({ onCreated }) {
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
          if (onCreated) onCreated(data);
          navigate("/rooms/" + data.uid);
        } else {
          toastr.error("Something went wrong!");
        }
      })
      .catch(error => console.log(error));
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        background: 'rgba(30,41,59,0.85)',
        border: '1px solid rgba(148,163,184,0.1)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Create a Room
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        Set up a new planning session for your team.
      </Typography>
      <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField label="Room Title" variant="outlined" required fullWidth autoFocus
          value={title} onChange={e => setTitle(e.target.value)} sx={fieldSx} />
        <TextField label="Description (optional)" variant="outlined" fullWidth
          value={description} onChange={e => setDescription(e.target.value)} sx={fieldSx} />
        <TextField label="Your Name" variant="outlined" required fullWidth
          value={creator} onChange={e => setCreator(e.target.value)} sx={fieldSx} />
        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          onClick={createRoomOnClick}
          sx={{
            mt: 1, py: 1.5,
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
            '&:hover': {
              background: 'linear-gradient(135deg, #818cf8, #6366f1)',
              boxShadow: '0 4px 28px rgba(99,102,241,0.5)',
            },
          }}
        >
          Create Room
        </Button>
      </Box>
    </Paper>
  );
}

export default CreateRoom;
