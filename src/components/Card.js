import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

function StoryPointCard({ storyPoint, isMyVote, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        minWidth: 52,
        height: 72,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        flexShrink: 0,
        border: isMyVote ? '2px solid #6366f1' : '1px solid rgba(148,163,184,0.15)',
        bgcolor: isMyVote ? 'rgba(99,102,241,0.15)' : 'rgba(30,41,59,0.8)',
        transform: isMyVote ? 'translateY(-8px)' : 'translateY(0)',
        boxShadow: isMyVote ? '0 8px 24px rgba(99,102,241,0.3)' : 'none',
        transition: 'all 0.2s ease',
        userSelect: 'none',
        '&:hover': {
          border: '2px solid rgba(99,102,241,0.6)',
          bgcolor: 'rgba(99,102,241,0.1)',
          transform: 'translateY(-6px)',
          boxShadow: '0 6px 20px rgba(99,102,241,0.2)',
        },
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: isMyVote ? '#818cf8' : '#94a3b8',
          fontSize: storyPoint.length > 2 ? 14 : 18,
        }}
      >
        {storyPoint}
      </Typography>
    </Box>
  );
}

export default StoryPointCard;
