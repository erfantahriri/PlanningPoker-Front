import React, { Component } from 'react';
import toastr from 'toastr';
import StoryPointCard from './Card';
import VoteCard from './VoteCard';
import { submitRoomIssueVote, updateIssue, flipIssueVoteCards, removeIssueVotes } from '../services/api';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import UpdateIssueComponent from './UpdateIssue';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import EditIcon from '@mui/icons-material/Edit';
import StyleIcon from '@mui/icons-material/Style';

export class Board extends Component {
  storyPoints = ["0", "1/2", "1", "2", "3", "5", "8", "13", "20", "40", "100", "?"];

  state = {
    updateIssueDialogOpen: false,
    currentIssueEstimatedPoints: undefined,
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
    const { currentIssue } = this.props;
    const hasIssue = !!currentIssue;
    const votes = currentIssue?.votes ?? [];

    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: { xs: 1.5, sm: 3 } }}>

        {/* Issue Header */}
        <Box sx={{
          p: { xs: 2, sm: 3 }, mb: { xs: 1.5, sm: 3 }, borderRadius: 3,
          bgcolor: 'rgba(30,41,59,0.6)',
          border: '1px solid rgba(148,163,184,0.08)',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 1.5, fontSize: 10 }}>
                Current Issue
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: hasIssue ? '#f1f5f9' : '#475569',
                  mt: 0.25,
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                  lineHeight: 1.3,
                }}
              >
                {hasIssue ? currentIssue.title : 'No issue selected'}
              </Typography>
              {hasIssue && currentIssue.estimated_points && (
                <Chip
                  label={`${currentIssue.estimated_points} pts`}
                  size="small"
                  sx={{
                    mt: 1, bgcolor: 'rgba(16,185,129,0.15)',
                    color: '#34d399', border: '1px solid rgba(16,185,129,0.25)', fontWeight: 600,
                  }}
                />
              )}
            </Box>

            {hasIssue && (
              <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, mt: 0.5 }}>
                <Tooltip title="Flip cards">
                  <IconButton size="small" onClick={this.handleClickFlipCard} sx={{
                    width: 36, height: 36, color: '#818cf8',
                    bgcolor: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 2,
                    '&:hover': { bgcolor: 'rgba(99,102,241,0.2)' },
                    '&:active': { transform: 'scale(0.94)' },
                  }}>
                    <StyleIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Reset votes">
                  <IconButton size="small" onClick={this.handleClickResetBoard} sx={{
                    width: 36, height: 36, color: '#94a3b8',
                    bgcolor: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 2,
                    '&:hover': { bgcolor: 'rgba(148,163,184,0.15)' },
                    '&:active': { transform: 'scale(0.94)' },
                  }}>
                    <AutorenewIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Set estimated points">
                  <IconButton size="small" onClick={() => this.setState({ updateIssueDialogOpen: true })} sx={{
                    width: 36, height: 36, color: '#34d399',
                    bgcolor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 2,
                    '&:hover': { bgcolor: 'rgba(16,185,129,0.18)' },
                    '&:active': { transform: 'scale(0.94)' },
                  }}>
                    <EditIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>
        </Box>

        {/* Vote Cards Area */}
        <Box sx={{
          flexGrow: 1,
          display: 'flex',
          flexWrap: 'wrap',
          alignContent: 'flex-start',
          gap: { xs: 1.5, sm: 2 },
          overflowY: 'auto',
          pb: 1,
        }}>
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

        {/* Story Point Selection Bar */}
        <Box sx={{
          mt: { xs: 1.5, sm: 3 },
          p: { xs: 1.5, sm: 2 },
          borderRadius: 3,
          bgcolor: 'rgba(30,41,59,0.6)',
          border: '1px solid rgba(148,163,184,0.08)',
          display: 'flex',
          gap: { xs: 1, sm: 1.5 },
          overflowX: 'auto',
          opacity: hasIssue ? 1 : 0.4,
          pointerEvents: hasIssue ? 'auto' : 'none',
          WebkitOverflowScrolling: 'touch',
          '&::-webkit-scrollbar': { height: 0 },
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
