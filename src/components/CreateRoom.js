import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
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
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [cardSet, setCardSet] = useState('standard');

  const createRoomOnClick = (event) => {
    event.preventDefault();
    if (isPrivate && !password.trim()) {
      toastr.error('Please set a password for the private room.');
      return;
    }
    createRoom(title, description, creator, isPrivate, isPrivate ? password : '', cardSet)
      .then(data => {
        if (data) {
          localStorage.setItem("accessToken", data.creator.access_token);
          localStorage.setItem("userUid", data.creator.uid);
          localStorage.setItem("userName", creator);
          localStorage.setItem("userRole", "voter");
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
          value={title} onChange={e => setTitle(e.target.value)}
          inputProps={{ style: { fontSize: 16 } }} sx={fieldSx} />
        <TextField label="Description (optional)" variant="outlined" fullWidth
          value={description} onChange={e => setDescription(e.target.value)}
          inputProps={{ style: { fontSize: 16 } }} sx={fieldSx} />
        <TextField label="Your Name" variant="outlined" required fullWidth
          value={creator} onChange={e => setCreator(e.target.value)}
          inputProps={{ style: { fontSize: 16 } }} sx={fieldSx} />

        {/* Private toggle */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {[
            { value: false, label: '🌐 Public', desc: 'Anyone can join', Icon: LockOpenIcon },
            { value: true, label: '🔒 Private', desc: 'Password required', Icon: LockIcon },
          ].map(opt => (
            <Box
              key={String(opt.value)}
              onClick={() => setIsPrivate(opt.value)}
              sx={{
                flex: 1, p: 1.5, borderRadius: 2, cursor: 'pointer',
                border: isPrivate === opt.value
                  ? '2px solid #6366f1'
                  : '1px solid rgba(148,163,184,0.15)',
                bgcolor: isPrivate === opt.value
                  ? 'rgba(99,102,241,0.1)'
                  : 'rgba(15,23,42,0.4)',
                transition: 'all 0.15s',
                '&:active': { transform: 'scale(0.98)' },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700, color: isPrivate === opt.value ? '#818cf8' : '#94a3b8' }}>
                {opt.label}
              </Typography>
              <Typography variant="caption" sx={{ color: '#475569', lineHeight: 1.3 }}>
                {opt.desc}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Card set picker */}
        <Box>
          <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1 }}>Card Set</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {[
              { value: 'standard', label: '🃏 Standard', desc: '0–100, ?, ☕' },
              { value: 'fibonacci', label: '🌀 Fibonacci', desc: '1,2,3,5,8,13…' },
              { value: 'tshirt', label: '👕 T-Shirt', desc: 'XS,S,M,L,XL' },
            ].map(opt => (
              <Box
                key={opt.value}
                onClick={() => setCardSet(opt.value)}
                sx={{
                  flex: 1, p: 1.5, borderRadius: 2, cursor: 'pointer',
                  border: cardSet === opt.value ? '2px solid #6366f1' : '1px solid rgba(148,163,184,0.15)',
                  bgcolor: cardSet === opt.value ? 'rgba(99,102,241,0.1)' : 'rgba(15,23,42,0.4)',
                  transition: 'all 0.15s',
                  '&:active': { transform: 'scale(0.98)' },
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 700, color: cardSet === opt.value ? '#818cf8' : '#94a3b8', fontSize: 12 }}>
                  {opt.label}
                </Typography>
                <Typography variant="caption" sx={{ color: '#475569', lineHeight: 1.3, fontSize: 10 }}>
                  {opt.desc}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {isPrivate && (
          <TextField
            label="Room Password" variant="outlined" required fullWidth type="password"
            value={password} onChange={e => setPassword(e.target.value)}
            inputProps={{ style: { fontSize: 16 } }}
            sx={fieldSx}
          />
        )}

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
