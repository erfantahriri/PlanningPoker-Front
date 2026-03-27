import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

function VoteCard({ vote, vote_cards_status, onSelect }) {
  const revealed = vote_cards_status === 'visible';

  return (
    <Box
      onClick={revealed && onSelect ? () => onSelect(vote.estimated_points) : undefined}
      sx={{
        width: { xs: 80, sm: 96 },
        height: { xs: 116, sm: 136 },
        borderRadius: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: revealed
          ? '1px solid rgba(99,102,241,0.3)'
          : '1px solid rgba(148,163,184,0.12)',
        bgcolor: revealed ? 'rgba(99,102,241,0.08)' : 'rgba(30,41,59,0.8)',
        boxShadow: revealed ? '0 4px 20px rgba(99,102,241,0.15)' : 'none',
        transition: 'all 0.3s ease',
        cursor: revealed ? 'pointer' : 'default',
        gap: 1,
        WebkitTapHighlightColor: 'transparent',
        ...(revealed && {
          '&:hover': {
            bgcolor: 'rgba(99,102,241,0.18)',
            border: '1px solid rgba(99,102,241,0.6)',
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 28px rgba(99,102,241,0.3)',
          },
          '&:active': {
            transform: 'translateY(-2px) scale(0.97)',
          },
        }),
      }}
    >
      {revealed ? (
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700, color: '#818cf8', lineHeight: 1,
            fontSize: { xs: '1.5rem', sm: '2.125rem' },
          }}
        >
          {vote.estimated_points}
        </Typography>
      ) : (
        <Box sx={{
          width: { xs: 28, sm: 36 }, height: { xs: 38, sm: 48 }, borderRadius: 1,
          background: 'linear-gradient(135deg, #1e293b, #334155)',
          border: '1px solid rgba(148,163,184,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: { xs: 16, sm: 20 },
        }}>
          ♠
        </Box>
      )}
      <Typography
        variant="caption"
        sx={{
          color: revealed ? '#94a3b8' : '#475569',
          fontWeight: 500,
          textAlign: 'center',
          px: 1,
          lineHeight: 1.3,
          fontSize: { xs: 10, sm: 12 },
        }}
        noWrap
      >
        {vote.participant.name}
      </Typography>
    </Box>
  );
}

export default VoteCard;
