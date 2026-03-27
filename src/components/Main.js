import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import CreateRoom from './CreateRoom';
import JoinRoom from './JoinRoom';

export class Main extends Component {
  state = { action: undefined }

  render() {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #6366f1, #818cf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              boxShadow: '0 0 40px rgba(99,102,241,0.4)',
              fontSize: 36,
              userSelect: 'none',
            }}
          >
            ♠
          </Box>
          <Typography
            variant="h3"
            sx={{ fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.5px', mb: 1.5 }}
          >
            Planning Poker
          </Typography>
          <Typography variant="body1" sx={{ color: '#94a3b8' }}>
            Real-time story point estimation for agile teams.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Button
            component={Link}
            to="/rooms/"
            variant="outlined"
            startIcon={<MeetingRoomIcon />}
            sx={{
              borderColor: 'rgba(99,102,241,0.3)',
              color: '#818cf8',
              '&:hover': { borderColor: '#6366f1', background: 'rgba(99,102,241,0.08)' },
            }}
          >
            Browse Rooms
          </Button>
        </Box>

        {!this.state.action && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => this.setState({ action: 'join' })}
              sx={{
                px: 4, py: 1.5,
                borderColor: 'rgba(99,102,241,0.5)',
                color: '#818cf8',
                '&:hover': { borderColor: '#6366f1', background: 'rgba(99,102,241,0.08)' },
              }}
            >
              Join a Room
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={() => this.setState({ action: 'create' })}
              sx={{
                px: 4, py: 1.5,
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                boxShadow: '0 4px 24px rgba(99,102,241,0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #818cf8, #6366f1)',
                  boxShadow: '0 4px 32px rgba(99,102,241,0.5)',
                },
              }}
            >
              Create a Room
            </Button>
          </Box>
        )}

        {this.state.action === 'create' && (
          <Box sx={{ width: '100%', maxWidth: 420 }}>
            <CreateRoom />
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography
                variant="body2"
                onClick={() => this.setState({ action: 'join' })}
                sx={{ color: '#94a3b8', cursor: 'pointer', '&:hover': { color: '#818cf8' } }}
              >
                Already have a room ID? Join instead →
              </Typography>
            </Box>
          </Box>
        )}

        {this.state.action === 'join' && (
          <Box sx={{ width: '100%', maxWidth: 420 }}>
            <JoinRoom />
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography
                variant="body2"
                onClick={() => this.setState({ action: 'create' })}
                sx={{ color: '#94a3b8', cursor: 'pointer', '&:hover': { color: '#818cf8' } }}
              >
                Need a new room? Create one →
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    );
  }
}

export default Main;
