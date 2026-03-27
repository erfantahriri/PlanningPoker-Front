import React, { Component } from 'react';
import toastr from 'toastr';
import StoryPointCard from './Card';
import VoteCard from './VoteCard';
import { submitRoomIssueVote, updateIssue, flipIssueVoteCards, removeIssueVotes } from '../services/api';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import EditIcon from '@mui/icons-material/Edit';
import StyleIcon from '@mui/icons-material/Style';
import TimerIcon from '@mui/icons-material/Timer';
import TimerOffIcon from '@mui/icons-material/TimerOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import UpdateIssueComponent from './UpdateIssue';

const CARD_SETS = {
  standard: ["0", "½", "1", "2", "3", "5", "8", "13", "20", "40", "100", "?", "☕"],
  fibonacci: ["1", "2", "3", "5", "8", "13", "21", "34", "55", "?", "☕"],
  tshirt: ["XS", "S", "M", "L", "XL", "XXL", "?"],
};

const REACTIONS = ['👍', '🤔', '❓', '🎯', '☕', '🚀'];

const TIMER_DURATIONS = [
  { label: '30s', value: 30 },
  { label: '1 min', value: 60 },
  { label: '2 min', value: 120 },
  { label: '3 min', value: 180 },
];

function TimerDisplay({ seconds, active }) {
  if (!active) return null;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const isUrgent = seconds <= 10;
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 0.75,
      px: 1.5, py: 0.5, borderRadius: 2,
      bgcolor: isUrgent ? 'rgba(244,63,94,0.15)' : 'rgba(99,102,241,0.12)',
      border: `1px solid ${isUrgent ? 'rgba(244,63,94,0.35)' : 'rgba(99,102,241,0.3)'}`,
      transition: 'all 0.3s',
    }}>
      <TimerIcon sx={{ fontSize: 14, color: isUrgent ? '#f43f5e' : '#818cf8' }} />
      <Typography variant="body2" sx={{
        fontWeight: 700, fontFamily: 'monospace', fontSize: 15,
        color: isUrgent ? '#f43f5e' : '#818cf8',
        minWidth: 40, textAlign: 'center',
      }}>
        {mins > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : `${secs}s`}
      </Typography>
    </Box>
  );
}

function FloatingReactions({ reactions }) {
  if (!reactions || reactions.length === 0) return null;
  return (
    <Box sx={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 10 }}>
      {reactions.map((r, i) => (
        <Box
          key={r._key}
          sx={{
            position: 'absolute',
            bottom: `${20 + (i % 4) * 20}%`,
            right: `${8 + (i % 3) * 15}%`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25,
            animation: 'floatUp 3s ease-out forwards',
            '@keyframes floatUp': {
              '0%': { opacity: 1, transform: 'translateY(0) scale(1)' },
              '70%': { opacity: 1, transform: 'translateY(-60px) scale(1.3)' },
              '100%': { opacity: 0, transform: 'translateY(-100px) scale(0.8)' },
            },
          }}
        >
          <Typography sx={{ fontSize: 28, lineHeight: 1 }}>{r.emoji}</Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: 10, whiteSpace: 'nowrap' }}>{r.participantName}</Typography>
        </Box>
      ))}
    </Box>
  );
}

export class Board extends Component {
  state = {
    updateIssueDialogOpen: false,
    currentIssueEstimatedPoints: undefined,
    timerMenuAnchor: null,
  }

  get storyPoints() {
    return CARD_SETS[this.props.cardSet] || CARD_SETS.standard;
  }

  storyPointCardOnClick = (storyPoint) => {
    submitRoomIssueVote(this.props.roomUid, this.props.currentIssue.uid, storyPoint)
      .catch(error => { console.log(error); toastr.error("Something went wrong!"); });
  }

  handleClickFlipCard = () => {
    flipIssueVoteCards(this.props.roomUid, this.props.currentIssue.uid)
      .then(data => { if (!data) toastr.error("Something went wrong!"); })
      .catch(error => console.log(error));
  };

  handleClickResetBoard = () => {
    removeIssueVotes(this.props.roomUid, this.props.currentIssue.uid)
      .then(data => { if (!data) toastr.error("Something went wrong!"); })
      .catch(error => console.log(error));
  };

  handleUpdateIssue = () => {
    updateIssue(
      this.props.roomUid, this.props.currentIssue.uid,
      this.props.currentIssue.title, this.state.currentIssueEstimatedPoints,
    ).then(data => {
      if (data) this.setState({ updateIssueDialogOpen: false });
    }).catch(error => console.log(error));
  };

  handleSelectVote = (points) => {
    updateIssue(
      this.props.roomUid, this.props.currentIssue.uid,
      this.props.currentIssue.title, points,
    ).catch(error => console.log(error));
  };

  isMyVote(storyPoint) {
    if (!this.props.currentIssue) return false;
    const myVote = (this.props.currentIssue.votes ?? []).filter(
      v => v.participant.uid === localStorage.getItem('userUid')
    );
    return myVote.length > 0 && storyPoint === myVote[0].estimated_points;
  }

  render() {
    const { currentIssue, timerActive, remainingSeconds, onTimerStart, onTimerStop, reactions, onReaction } = this.props;
    const hasIssue = !!currentIssue;
    const votes = currentIssue?.votes ?? [];
    const isSpectator = localStorage.getItem('userRole') === 'spectator';

    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: { xs: 1.5, sm: 3 } }}>

        {/* Issue Header */}
        <Box sx={{
          p: { xs: 2, sm: 3 }, mb: { xs: 1.5, sm: 3 }, borderRadius: 3,
          bgcolor: 'rgba(30,41,59,0.6)', border: '1px solid rgba(148,163,184,0.08)',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 1.5, fontSize: 10 }}>
                Current Issue
              </Typography>
              <Typography variant="h6" sx={{
                fontWeight: 700, color: hasIssue ? '#f1f5f9' : '#475569',
                mt: 0.25, fontSize: { xs: '1rem', sm: '1.25rem' }, lineHeight: 1.3,
              }}>
                {hasIssue ? currentIssue.title : 'No issue selected'}
              </Typography>
              {hasIssue && currentIssue.estimated_points && (
                <Chip label={`${currentIssue.estimated_points} pts`} size="small" sx={{
                  mt: 1, bgcolor: 'rgba(16,185,129,0.15)', color: '#34d399',
                  border: '1px solid rgba(16,185,129,0.25)', fontWeight: 600,
                }} />
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end', mt: 0.5 }}>
              <TimerDisplay seconds={remainingSeconds} active={timerActive} />

              {timerActive ? (
                <Tooltip title="Stop timer">
                  <IconButton size="small" onClick={onTimerStop} sx={{
                    width: 36, height: 36, color: '#f43f5e',
                    bgcolor: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 2,
                    '&:hover': { bgcolor: 'rgba(244,63,94,0.18)' },
                  }}>
                    <TimerOffIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              ) : (
                <>
                  <Tooltip title="Start timer">
                    <IconButton size="small" onClick={e => this.setState({ timerMenuAnchor: e.currentTarget })} sx={{
                      width: 36, height: 36, color: '#94a3b8',
                      bgcolor: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 2,
                      '&:hover': { bgcolor: 'rgba(148,163,184,0.15)', color: '#818cf8' },
                    }}>
                      <TimerIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={this.state.timerMenuAnchor}
                    open={Boolean(this.state.timerMenuAnchor)}
                    onClose={() => this.setState({ timerMenuAnchor: null })}
                    PaperProps={{ sx: { bgcolor: '#1e293b', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 2 } }}
                  >
                    {TIMER_DURATIONS.map(d => (
                      <MenuItem key={d.value} onClick={() => { onTimerStart(d.value); this.setState({ timerMenuAnchor: null }); }}
                        sx={{ color: '#94a3b8', fontSize: 14, '&:hover': { bgcolor: 'rgba(99,102,241,0.1)', color: '#818cf8' } }}>
                        {d.label}
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              )}

              {hasIssue && (
                <>
                  <Tooltip title="Flip cards">
                    <IconButton size="small" onClick={this.handleClickFlipCard} sx={{
                      width: 36, height: 36, color: '#818cf8',
                      bgcolor: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 2,
                      '&:hover': { bgcolor: 'rgba(99,102,241,0.2)' },
                    }}>
                      <StyleIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reset votes">
                    <IconButton size="small" onClick={this.handleClickResetBoard} sx={{
                      width: 36, height: 36, color: '#94a3b8',
                      bgcolor: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 2,
                      '&:hover': { bgcolor: 'rgba(148,163,184,0.15)' },
                    }}>
                      <AutorenewIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Set estimated points">
                    <IconButton size="small" onClick={() => this.setState({ updateIssueDialogOpen: true })} sx={{
                      width: 36, height: 36, color: '#34d399',
                      bgcolor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 2,
                      '&:hover': { bgcolor: 'rgba(16,185,129,0.18)' },
                    }}>
                      <EditIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>
          </Box>
        </Box>

        {/* Vote Cards Area */}
        <Box sx={{
          flexGrow: 1, position: 'relative',
          display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start',
          gap: { xs: 1.5, sm: 2 }, overflowY: 'auto', pb: 1,
        }}>
          <FloatingReactions reactions={reactions} />
          {!hasIssue && (
            <Box sx={{ width: '100%', py: { xs: 5, sm: 8 }, display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'text.secondary' }}>
              <Typography variant="h6" sx={{ mb: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>No issue selected</Typography>
              <Typography variant="body2">Pick an issue from the Issues tab</Typography>
            </Box>
          )}
          {hasIssue && votes.length === 0 && (
            <Box sx={{ width: '100%', py: { xs: 5, sm: 8 }, display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'text.secondary' }}>
              <Typography variant="h6" sx={{ mb: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>Waiting for votes...</Typography>
              <Typography variant="body2">Select a card below to cast your vote</Typography>
            </Box>
          )}
          {hasIssue && votes.map(vote => (
            <VoteCard
              key={vote.participant.uid}
              vote={vote}
              vote_cards_status={currentIssue.vote_cards_status}
              onSelect={this.handleSelectVote}
            />
          ))}
        </Box>

        {/* Reaction bar */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1, mb: 0.5 }}>
          {REACTIONS.map(emoji => (
            <Tooltip key={emoji} title="React">
              <IconButton
                size="small"
                onClick={() => onReaction && onReaction(emoji)}
                sx={{
                  fontSize: 18, width: 36, height: 36,
                  bgcolor: 'rgba(30,41,59,0.4)', border: '1px solid rgba(148,163,184,0.08)', borderRadius: 2,
                  '&:hover': { bgcolor: 'rgba(99,102,241,0.12)', transform: 'scale(1.2)' },
                  '&:active': { transform: 'scale(0.9)' },
                  transition: 'transform 0.1s',
                }}
              >
                {emoji}
              </IconButton>
            </Tooltip>
          ))}
        </Box>

        {/* Story Point Selection Bar */}
        {isSpectator ? (
          <Box sx={{
            mt: 0.5, p: { xs: 1.5, sm: 2 }, borderRadius: 3,
            bgcolor: 'rgba(30,41,59,0.4)', border: '1px solid rgba(148,163,184,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
          }}>
            <VisibilityIcon sx={{ fontSize: 16, color: '#475569' }} />
            <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
              You are spectating — enjoy the show
            </Typography>
          </Box>
        ) : (
          <Box sx={{
            mt: 0.5, p: { xs: 1.5, sm: 2 }, borderRadius: 3,
            bgcolor: 'rgba(30,41,59,0.6)', border: '1px solid rgba(148,163,184,0.08)',
            display: 'flex', gap: { xs: 1, sm: 1.5 }, overflowX: 'auto',
            opacity: hasIssue ? 1 : 0.4, pointerEvents: hasIssue ? 'auto' : 'none',
            WebkitOverflowScrolling: 'touch', '&::-webkit-scrollbar': { height: 0 },
          }}>
            {this.storyPoints.map(sp => (
              <StoryPointCard
                key={sp}
                storyPoint={sp}
                isMyVote={this.isMyVote(sp)}
                onClick={() => this.storyPointCardOnClick(sp)}
              />
            ))}
          </Box>
        )}

        <UpdateIssueComponent
          updateIssueDialogOpen={this.state.updateIssueDialogOpen}
          handleUpdateIssueDialogClose={() => this.setState({ updateIssueDialogOpen: false })}
          handleUpdateIssue={this.handleUpdateIssue}
          handleEstimatedPointsChange={e => this.setState({ currentIssueEstimatedPoints: e.target.value })}
        />
      </Box>
    );
  }
}

export default Board;
