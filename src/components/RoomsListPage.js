import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LockIcon from '@mui/icons-material/Lock';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import PeopleIcon from '@mui/icons-material/People';
import RefreshIcon from '@mui/icons-material/Refresh';
import TaskIcon from '@mui/icons-material/Task';
import CreateRoom from './CreateRoom';
import { getRooms } from '../services/api';

function RoomCardSkeleton() {
  return (
    <Card elevation={0} sx={{
      bgcolor: 'rgba(30,41,59,0.5)', border: '1px solid rgba(148,163,184,0.08)', borderRadius: 3,
    }}>
      <CardContent sx={{ p: 2.5 }}>
        <Skeleton variant="text" width="60%" height={24} sx={{ bgcolor: 'rgba(148,163,184,0.1)' }} />
        <Skeleton variant="text" width="90%" height={18} sx={{ bgcolor: 'rgba(148,163,184,0.07)', mt: 0.5 }} />
        <Skeleton variant="text" width="40%" height={18} sx={{ bgcolor: 'rgba(148,163,184,0.07)' }} />
        <Skeleton variant="rounded" width={80} height={28} sx={{ bgcolor: 'rgba(148,163,184,0.08)', mt: 2, borderRadius: 2 }} />
      </CardContent>
    </Card>
  );
}

function RoomsListPage() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const fetchRooms = () => {
    setLoading(true);
    getRooms()
      .then(data => setRooms(data ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRooms(); }, []);

  const formatDate = (iso) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      px: 2, py: 6,
    }}>

      {/* Hero */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Box sx={{
          width: 64, height: 64, borderRadius: '18px',
          background: 'linear-gradient(135deg, #6366f1, #818cf8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          mx: 'auto', mb: 3, fontSize: 32, userSelect: 'none',
          boxShadow: '0 0 40px rgba(99,102,241,0.4)',
        }}>♠</Box>
        <Typography variant="h3" sx={{ fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.5px', mb: 1, fontSize: { xs: '2rem', sm: '3rem' } }}>
          Planning Poker
        </Typography>
        <Typography variant="body1" sx={{ color: '#94a3b8' }}>
          Real-time story point estimation for agile teams.
        </Typography>
      </Box>

      <Box sx={{ width: '100%', maxWidth: 640 }}>

        {/* Rooms list header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 1.5 }}>
              Available Rooms
            </Typography>
            {!loading && (
              <Chip label={rooms.length} size="small"
                sx={{ bgcolor: 'rgba(99,102,241,0.15)', color: '#818cf8', height: 18, fontSize: 11 }} />
            )}
          </Box>
          <Button
            size="small"
            startIcon={loading ? <CircularProgress size={12} sx={{ color: '#475569' }} /> : <RefreshIcon sx={{ fontSize: 14 }} />}
            onClick={fetchRooms}
            disabled={loading}
            sx={{ color: '#475569', fontSize: 12, '&:hover': { color: '#818cf8' } }}
          >
            Refresh
          </Button>
        </Box>

        {/* Skeletons */}
        {loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {[1, 2, 3].map(i => <RoomCardSkeleton key={i} />)}
          </Box>
        )}

        {/* Empty state */}
        {!loading && rooms.length === 0 && (
          <Box sx={{
            py: 6, textAlign: 'center', borderRadius: 3,
            bgcolor: 'rgba(30,41,59,0.4)', border: '1px solid rgba(148,163,184,0.08)',
          }}>
            <MeetingRoomIcon sx={{ fontSize: 40, color: '#334155', mb: 1.5 }} />
            <Typography variant="body1" sx={{ color: '#475569', fontWeight: 500 }}>No rooms yet</Typography>
            <Typography variant="body2" sx={{ color: '#334155', mt: 0.5 }}>Create one to get started.</Typography>
          </Box>
        )}

        {/* Room cards */}
        {!loading && rooms.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {rooms.map(room => (
              <Card
                key={room.uid}
                elevation={0}
                onClick={() => navigate(`/rooms/${room.uid}`)}
                sx={{
                  bgcolor: 'rgba(30,41,59,0.5)',
                  border: '1px solid rgba(148,163,184,0.08)',
                  borderRadius: 3, cursor: 'pointer',
                  transition: 'all 0.15s',
                  '&:hover': {
                    bgcolor: 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.25)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 20px rgba(99,102,241,0.1)',
                  },
                  '&:active': { transform: 'scale(0.99)' },
                }}
              >
                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f1f5f9', lineHeight: 1.3 }}>
                          {room.title}
                        </Typography>
                        {room.is_private && (
                          <LockIcon sx={{ fontSize: 14, color: '#f59e0b', flexShrink: 0 }} />
                        )}
                      </Box>
                      {room.description && (
                        <Typography variant="body2" sx={{
                          color: '#64748b', mt: 0.5, lineHeight: 1.4,
                          display: '-webkit-box', WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>
                          {room.description}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PeopleIcon sx={{ fontSize: 12, color: '#475569' }} />
                          <Typography variant="caption" sx={{ color: '#475569' }}>
                            {room.participant_count ?? 0}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <TaskIcon sx={{ fontSize: 12, color: '#475569' }} />
                          <Typography variant="caption" sx={{ color: '#475569' }}>
                            {room.issue_count ?? 0} {room.issue_count === 1 ? 'issue' : 'issues'}
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: '#334155' }}>
                          {formatDate(room.created)}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{
                      flexShrink: 0,
                      width: 36, height: 36, borderRadius: 2,
                      bgcolor: 'rgba(99,102,241,0.1)',
                      border: '1px solid rgba(99,102,241,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <ArrowForwardIcon sx={{ fontSize: 16, color: '#6366f1' }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        <Divider sx={{ borderColor: 'rgba(148,163,184,0.08)', my: 3 }} />

        {/* Create room */}
        {!showCreate ? (
          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={<AddIcon />}
            onClick={() => setShowCreate(true)}
            sx={{
              py: 1.5, fontSize: 15,
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              boxShadow: '0 4px 24px rgba(99,102,241,0.35)',
              '&:hover': { background: 'linear-gradient(135deg, #818cf8, #6366f1)' },
            }}
          >
            Create New Room
          </Button>
        ) : (
          <Box>
            <CreateRoom onCreated={() => { setShowCreate(false); fetchRooms(); }} />
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography
                variant="body2"
                onClick={() => setShowCreate(false)}
                sx={{ color: '#475569', cursor: 'pointer', '&:hover': { color: '#818cf8' } }}
              >
                ← Back to rooms
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default RoomsListPage;
