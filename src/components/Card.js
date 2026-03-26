import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

function StoryPointCard({ storyPoint, isMyVote }) {
  return (
    <Card style={{
      minWidth: 40,
      margin: "7px",
      display: "inline-block",
      marginBottom: "7px",
      transition: "0.3s",
      ...(isMyVote && {
        backgroundColor: "#e0e0e0",
        transform: "translateY(-10px)",
      })
    }}>
      <CardContent>
        <Typography variant="h5" component="h2">
          {storyPoint}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default StoryPointCard;
