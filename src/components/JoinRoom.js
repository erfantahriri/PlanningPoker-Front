import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { joinRoom } from '../services/api';
import toastr from 'toastr';

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: 'rgba(148,163,184,0.2)' },
    '&:hover fieldset': { borderColor: 'rgba(99,102,241,0.5)' },
    '&.Mui-focused fieldset': { borderColor: '#6366f1' },
  },
};

function JoinRoom() {
  const navigate = useNavigate();
  const [roomUid, setRoomUid] = useState('');
  const [participantName, setParticipantName] = useState('');

  const joinRoomOnClick = (event) => {
    event.preventDefault();
    joinRoom(roomUid, participantName)
      .then(data => {
        if (data) {
          localStorage.setItem("accessToken", data.access_token);
          localStorage.setItem("userUid", data.uid);
          navigate("/rooms/" + roomUid);
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
        Join a Room
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        Enter the room ID shared by your team.
      </Typography>
      <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField label="Room ID" variant="outlined" required fullWidth autoFocus
          value={roomUid} onChange={e => setRoomUid(e.target.value)} sx={fieldSx} />
        <TextField label="Your Name" variant="outlined" required fullWidth
          value={participantName} onChange={e => setParticipantName(e.target.value)} sx={fieldSx} />
        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          onClick={joinRoomOnClick}
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
          Join Room
        </Button>
      </Box>
    </Paper>
  );
}

export default JoinRoom;
