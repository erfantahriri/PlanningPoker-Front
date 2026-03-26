import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

function VoteCard({ vote, vote_cards_status }) {
  return (
    <Card sx={{ minWidth: 40, margin: "7px", display: "inline-block" }}>
      <CardContent>
        <Typography variant="subtitle1" component="p" style={{ textAlign: "center" }}>
          {vote.participant.name}
        </Typography>
        <Typography variant="h4" component="h2" style={{ textAlign: "center", marginTop: "10px" }}>
          {vote_cards_status === "visible" ? vote.estimated_points : "***"}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default VoteCard;
