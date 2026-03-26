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
import { joinRoom } from '../services/api';
import toastr from 'toastr';

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
    <Box sx={{ width: { xs: 'auto', sm: 400 }, mx: 'auto' }}>
      <CssBaseline />
      <Paper sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', p: '16px 24px 24px' }}>
        <Typography component="h1" variant="h5">
          Join An Existing Room
        </Typography>
        <Box component="form" sx={{ width: '100%', mt: 1 }}>
          <FormControl margin="normal" required fullWidth>
            <InputLabel htmlFor="roomUid">Room ID</InputLabel>
            <Input id="roomUid" name="roomUid" autoFocus
              value={roomUid} onChange={e => setRoomUid(e.target.value)} />
          </FormControl>
          <FormControl margin="normal" required fullWidth>
            <InputLabel htmlFor="participantName">Name to be shown</InputLabel>
            <Input name="participantName" id="participantName"
              value={participantName} onChange={e => setParticipantName(e.target.value)} />
          </FormControl>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
            onClick={joinRoomOnClick}
          >
            Join
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default JoinRoom;
