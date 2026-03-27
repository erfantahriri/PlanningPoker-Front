import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { joinRoom } from '../services/api';
import toastr from 'toastr';
import InputAdornment from '@mui/material/InputAdornment';
import LockIcon from '@mui/icons-material/Lock';

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
  const [role, setRole] = useState('dev');
  const [password, setPassword] = useState('');

  const joinRoomOnClick = (event) => {
    event.preventDefault();
    joinRoom(roomUid, participantName, role, password)
      .then(data => {
        if (data) {
          localStorage.setItem('accessToken', data.access_token);
          localStorage.setItem('userUid', data.uid);
          localStorage.setItem('userName', participantName);
          localStorage.setItem('userRole', role);
          localStorage.setItem('roomUid', roomUid);
          navigate('/rooms/' + roomUid);
        } else {
          toastr.error('Something went wrong!');
        }
      })
      .catch(err => toastr.error(typeof err === 'string' ? err : 'Something went wrong!'));
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
          value={roomUid} onChange={e => setRoomUid(e.target.value)}
          inputProps={{ style: { fontSize: 16 } }} sx={fieldSx} />
        <TextField label="Your Name" variant="outlined" required fullWidth
          value={participantName} onChange={e => setParticipantName(e.target.value)}
          inputProps={{ style: { fontSize: 16 } }} sx={fieldSx} />

        {/* Role picker */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
          {[
            { value: 'dev', label: '🧑‍💻 Dev', desc: 'Estimates story points' },
            { value: 'designer', label: '🎨 Designer', desc: 'Estimates design tasks' },
            { value: 'pm', label: '📋 PM', desc: 'Facilitates, watch only' },
            { value: 'em', label: '👔 EM', desc: 'Observes, watch only' },
          ].map(opt => (
            <Box
              key={opt.value}
              onClick={() => setRole(opt.value)}
              sx={{
                p: 1.5, borderRadius: 2, cursor: 'pointer',
                border: role === opt.value
                  ? '2px solid #6366f1'
                  : '1px solid rgba(148,163,184,0.15)',
                bgcolor: role === opt.value
                  ? 'rgba(99,102,241,0.1)'
                  : 'rgba(15,23,42,0.4)',
                transition: 'all 0.15s',
                '&:active': { transform: 'scale(0.98)' },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700, color: role === opt.value ? '#818cf8' : '#94a3b8' }}>
                {opt.label}
              </Typography>
              <Typography variant="caption" sx={{ color: '#475569', lineHeight: 1.3 }}>
                {opt.desc}
              </Typography>
            </Box>
          ))}
        </Box>

        <TextField
          label="Room Password (if private)" variant="outlined" fullWidth type="password"
          value={password} onChange={e => setPassword(e.target.value)}
          inputProps={{ style: { fontSize: 16 } }}
          InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon sx={{ fontSize: 16, color: '#475569' }} /></InputAdornment> }}
          sx={fieldSx}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          onClick={joinRoomOnClick}
          sx={{
            mt: 1, py: 1.5, fontSize: 16,
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
