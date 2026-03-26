import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  getRoomIssues,
  getRoomParticipants,
  createIssue,
  getRoomCurrentIssue,
  setRoomCurrentIssue
} from '../services/api';
import toastr from 'toastr';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Person from '@mui/icons-material/Person';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUnchecked from '@mui/icons-material/RadioButtonUnchecked';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import CreateIssueComponent from './CreateIssue';
import Board from './Board';

const drawerWidth = 240;
const BaseRoomWsUrl = `ws://127.0.0.1:8000/ws/rooms/`;

function Room() {
  const { roomUid } = useParams();
  const ws = useRef(null);

  const [issues, setIssues] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [createIssueDialogOpen, setCreateIssueDialogOpen] = useState(false);
  const [issueTitle, setIssueTitle] = useState('');
  const [currentIssue, setCurrentIssue] = useState(undefined);

  const handleClickOpen = () => setCreateIssueDialogOpen(true);
  const handleClose = () => setCreateIssueDialogOpen(false);

  const handleCreateIssue = () => {
    createIssue(roomUid, issueTitle)
      .then(data => {
        if (data) {
          setCreateIssueDialogOpen(false);
        } else {
          toastr.error("Something went wrong!");
        }
      })
      .catch(error => console.log(error));
  };

  const issueItemOnClick = (issue) => {
    setRoomCurrentIssue(roomUid, issue.uid)
      .then(data => {
        if (!data) {
          toastr.error("Something went wrong!");
        }
      })
      .catch(error => console.log(error));
  };

  useEffect(() => {
    getRoomIssues(roomUid)
      .then(data => {
        if (data) {
          setIssues(data);
        } else {
          toastr.error("Something went wrong!");
        }
      })
      .catch(error => console.log(error));

    getRoomCurrentIssue(roomUid)
      .then(data => {
        if (data) setCurrentIssue(data);
      })
      .catch(error => console.log(error));

    getRoomParticipants(roomUid)
      .then(data => {
        if (data) {
          setParticipants(data);
        } else {
          toastr.error("Something went wrong!");
        }
      })
      .catch(error => console.log(error));

    ws.current = new WebSocket(BaseRoomWsUrl + roomUid + '/');

    ws.current.onopen = () => console.log('connected');

    ws.current.onmessage = evt => {
      const message = JSON.parse(evt.data);
      switch (message.type) {

        case "add_issue":
          setIssues(prev => [message.content, ...prev]);
          break;

        case "update_issue":
          setCurrentIssue(prev =>
            prev && prev.uid === message.content.uid ? message.content : prev
          );
          setIssues(prev => prev.map(issue =>
            issue.uid !== message.content.uid ? issue : message.content
          ));
          break;

        case "add_participant":
          setParticipants(prev => [message.content, ...prev]);
          break;

        case "current_issue":
          setCurrentIssue(message.content);
          setIssues(prev => prev.map(issue => ({
            ...issue,
            is_current: issue.uid === message.content.uid
          })));
          break;

        case "add_vote":
          setCurrentIssue(prev => ({
            ...prev,
            votes: [message.content, ...prev.votes.filter(
              v => v.participant.uid !== message.content.participant.uid
            )]
          }));
          break;

        default:
          break;
      }
    };

    ws.current.onclose = () => {
      console.log('disconnected');
      ws.current = new WebSocket(BaseRoomWsUrl + roomUid + '/');
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [roomUid]);

  return (
    <div style={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" color="inherit" noWrap sx={{ textAlign: "center" }}>
            Planning Poker - Room ID to invite other: {roomUid}
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <h3 style={{ textAlign: "center" }}>Participants</h3>
        <Divider />
        <List>
          {participants.map((participant) => (
            <ListItem button key={participant.uid}>
              <ListItemIcon style={
                localStorage.getItem('userUid') === participant.uid ?
                  { color: "#3f51b5" } : { color: "gray" }
              }><Person /></ListItemIcon>
              <ListItemText primary={
                localStorage.getItem('userUid') === participant.uid ?
                  participant.name + " (you)" : participant.name
              } />
            </ListItem>
          ))}
        </List>
      </Drawer>

      <main style={{ flexGrow: 1, padding: '24px' }}>
        <Toolbar />
        <Board
          currentIssue={currentIssue}
          roomUid={roomUid}
        />
      </main>

      <Drawer
        variant="permanent"
        anchor="right"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <h3 style={{ textAlign: "center" }}>Issues</h3>
        <Divider />
        <List>
          {issues.map((issue) => (
            <ListItem button key={issue.uid} onClick={() => issueItemOnClick(issue)}>
              <ListItemIcon>
                {issue.is_current ? <CheckCircleOutline /> : <RadioButtonUnchecked />}
              </ListItemIcon>
              <ListItemText primary={issue.title} />
              <ListItemText
                primary={issue.estimated_points ? issue.estimated_points : "N/A"}
                style={{ textAlign: "right" }}
              />
            </ListItem>
          ))}
        </List>
        <Fab
          color="primary"
          aria-label="Add"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={handleClickOpen}
        >
          <AddIcon />
        </Fab>
        <CreateIssueComponent
          createIssueDialogOpen={createIssueDialogOpen}
          handleClose={handleClose}
          handleCreateIssue={handleCreateIssue}
          handleIssueTitleInputChange={(e) => setIssueTitle(e.target.value)}
        />
      </Drawer>
    </div>
  );
}

export default Room;
