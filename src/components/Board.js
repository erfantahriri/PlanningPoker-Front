import React, { Component } from 'react';
import toastr from 'toastr';
import StoryPointCard from './Card';
import VoteCard from './VoteCard';
import { submitRoomIssueVote, updateIssue, flipIssueVoteCards, removeIssueVotes } from '../services/api';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import UpdateIssueComponent from './UpdateIssue';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import StyleIcon from '@mui/icons-material/Style';
import EditIcon from '@mui/icons-material/Edit';

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
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>

        {/* Issue Header */}
        <Box
          sx={{
            p: 3, mb: 3, borderRadius: 3,
            bgcolor: 'rgba(30,41,59,0.6)',
            border: '1px solid rgba(148,163,184,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 1.5 }}>
              Current Issue
            </Typography>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: hasIssue ? '#f1f5f9' : '#475569', mt: 0.5 }}
              noWrap
            >
              {hasIssue ? currentIssue.title : 'No issue selected'}
            </Typography>
            {hasIssue && currentIssue.estimated_points && (
              <Chip
                label={`Estimated: ${currentIssue.estimated_points} pts`}
                size="small"
                sx={{
                  mt: 1, bgcolor: 'rgba(16,185,129,0.15)',
                  color: '#34d399', border: '1px solid rgba(16,185,129,0.25)',
                }}
              />
            )}
          </Box>
          {hasIssue && (
            <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<StyleIcon />}
                onClick={this.handleClickFlipCard}
                sx={{
                  borderColor: 'rgba(99,102,241,0.4)', color: '#818cf8',
                  '&:hover': { borderColor: '#6366f1', bgcolor: 'rgba(99,102,241,0.08)' },
                }}
              >
                Flip
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AutorenewIcon />}
                onClick={this.handleClickResetBoard}
                sx={{
                  borderColor: 'rgba(148,163,184,0.2)', color: '#94a3b8',
                  '&:hover': { borderColor: 'rgba(148,163,184,0.4)', bgcolor: 'rgba(148,163,184,0.05)' },
                }}
              >
                Reset
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={() => this.setState({ updateIssueDialogOpen: true })}
                sx={{
                  borderColor: 'rgba(16,185,129,0.4)', color: '#34d399',
                  '&:hover': { borderColor: '#10b981', bgcolor: 'rgba(16,185,129,0.08)' },
                }}
              >
                Update
              </Button>
            </Box>
          )}
        </Box>

        {/* Vote Cards Area */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start', gap: 2, overflowY: 'auto' }}>
          {hasIssue && votes.length === 0 && (
            <Box
              sx={{
                width: '100%', py: 8, display: 'flex', flexDirection: 'column',
                alignItems: 'center', color: 'text.secondary',
              }}
            >
              <Typography variant="h6" sx={{ mb: 1 }}>Waiting for votes...</Typography>
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
        <Box
          sx={{
            mt: 3, p: 2, borderRadius: 3,
            bgcolor: 'rgba(30,41,59,0.6)',
            border: '1px solid rgba(148,163,184,0.08)',
            display: 'flex', gap: 1.5, overflowX: 'auto',
            opacity: hasIssue ? 1 : 0.4,
            pointerEvents: hasIssue ? 'auto' : 'none',
            '&::-webkit-scrollbar': { height: 4 },
            '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
            '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(148,163,184,0.2)', borderRadius: 2 },
          }}
        >
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
