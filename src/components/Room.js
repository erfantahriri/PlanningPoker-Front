import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getRoomIssues, getRoomParticipants, createIssue,
  getRoomCurrentIssue, setRoomCurrentIssue, joinRoom
} from '../services/api';
import toastr from 'toastr';
import AppBar from '@mui/material/AppBar';
import Badge from '@mui/material/Badge';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import Fab from '@mui/material/Fab';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CreateIssueComponent from './CreateIssue';
import Board from './Board';
import Chat from './Chat';

const drawerWidth = 256;
const BaseRoomWsUrl = `ws://127.0.0.1:8000/ws/rooms/`;

function Room() {
  const { roomUid } = useParams();
  const navigate = useNavigate();
  const ws = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [joined, setJoined] = useState(!!localStorage.getItem('accessToken'));
  const [nameInput, setNameInput] = useState('');
  const [issues, setIssues] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [createIssueDialogOpen, setCreateIssueDialogOpen] = useState(false);
  const [issueTitle, setIssueTitle] = useState('');
  const [currentIssue, setCurrentIssue] = useState(undefined);
  const [copied, setCopied] = useState(false);
  const [rightTab, setRightTab] = useState(0);
  const [mobileTab, setMobileTab] = useState(0); // 0=board 1=issues 2=chat 3=people
  const [chatMessages, setChatMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const rightTabRef = useRef(0);
  const mobileTabRef = useRef(0);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    joinRoom(roomUid, nameInput.trim())
      .then(data => {
        if (data) {
          localStorage.setItem('accessToken', data.access_token);
          localStorage.setItem('userUid', data.uid);
          localStorage.setItem('userName', nameInput.trim());
          setJoined(true);
        } else {
          toastr.error('Room not found or something went wrong.');
        }
      })
      .catch(() => toastr.error('Could not join room.'));
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomUid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExit = () => {
    if (ws.current) ws.current.close();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userUid');
    localStorage.removeItem('userName');
    navigate('/');
  };

  const handleCreateIssue = () => {
    createIssue(roomUid, issueTitle)
      .then(data => {
        if (data) setCreateIssueDialogOpen(false);
        else toastr.error("Something went wrong!");
      })
      .catch(error => console.log(error));
  };

  const issueItemOnClick = (issue) => {
    setRoomCurrentIssue(roomUid, issue.uid)
      .then(data => { if (!data) toastr.error("Something went wrong!"); })
      .catch(error => console.log(error));
    if (isMobile) setMobileTab(0);
  };

  const handleSendChat = (text) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    const myUid = localStorage.getItem('userUid');
    const myName = localStorage.getItem('userName') ||
      participants.find(p => p.uid === myUid)?.name || 'Me';
    ws.current.send(JSON.stringify({
      type: 'chat_message',
      content: { sender: myName, senderUid: myUid, text },
    }));
  };

  useEffect(() => {
    if (!joined) return;
    getRoomIssues(roomUid).then(data => { if (data) setIssues(data); else toastr.error("Something went wrong!"); });
    getRoomCurrentIssue(roomUid).then(data => { if (data) setCurrentIssue(data); });
    getRoomParticipants(roomUid).then(data => { if (data) setParticipants(data); else toastr.error("Something went wrong!"); });

    let cleaned = false;

    const attachHandlers = (socket) => {
      socket.onopen = () => console.log('connected');
      socket.onmessage = evt => {
        const message = JSON.parse(evt.data);
        switch (message.type) {
          case "add_issue":
            setIssues(prev => [message.content, ...prev]);
            break;
          case "update_issue":
            setCurrentIssue(prev => {
              if (!prev || prev.uid !== message.content.uid) return prev;
              return { ...message.content, votes: message.content.votes ?? prev.votes ?? [] };
            });
            setIssues(prev => prev.map(i => i.uid !== message.content.uid ? i : message.content));
            break;
          case "add_participant":
            setParticipants(prev => [message.content, ...prev]);
            break;
          case "current_issue":
            setCurrentIssue(message.content);
            setIssues(prev => prev.map(i => ({ ...i, is_current: i.uid === message.content.uid })));
            break;
          case "add_vote":
            setCurrentIssue(prev => ({
              ...prev,
              votes: [message.content, ...(prev.votes ?? []).filter(v => v.participant.uid !== message.content.participant.uid)]
            }));
            break;
          case "chat_message":
            setChatMessages(prev => [...prev, message.content]);
            const isOnChat = mobileTabRef.current === 2 || rightTabRef.current === 1;
            if (!isOnChat) setUnreadCount(c => c + 1);
            break;
          default:
            break;
        }
      };
      socket.onclose = () => {
        if (cleaned) return;
        const newSocket = new WebSocket(BaseRoomWsUrl + roomUid + '/');
        ws.current = newSocket;
        attachHandlers(newSocket);
      };
    };

    ws.current = new WebSocket(BaseRoomWsUrl + roomUid + '/');
    attachHandlers(ws.current);
    return () => {
      cleaned = true;
      if (ws.current) ws.current.close();
    };
  }, [roomUid, joined]);

  const myUid = localStorage.getItem('userUid');

  // ── Join screen ────────────────────────────────────────────────────────────
  if (!joined) {
    return (
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 2,
      }}>
        <Box sx={{
          width: 40, height: 40, borderRadius: '12px',
          background: 'linear-gradient(135deg, #6366f1, #818cf8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, userSelect: 'none', mb: 3,
          boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
        }}>♠</Box>
        <Paper elevation={0} sx={{
          p: { xs: 3, sm: 4 }, width: '100%', maxWidth: 420,
          background: 'rgba(30,41,59,0.85)', border: '1px solid rgba(148,163,184,0.1)',
          backdropFilter: 'blur(12px)', borderRadius: 3,
        }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Join Room</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>Room ID</Typography>
          <Chip label={roomUid} sx={{
            mb: 3, fontFamily: 'monospace', fontWeight: 600, maxWidth: '100%',
            bgcolor: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)',
          }} />
          <Box component="form" onSubmit={handleJoin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Your Name" variant="outlined" required fullWidth autoFocus
              value={nameInput} onChange={e => setNameInput(e.target.value)}
              inputProps={{ style: { fontSize: 16 } }}
              sx={{ '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'rgba(148,163,184,0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(99,102,241,0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#6366f1' },
              }}}
            />
            <Button type="submit" variant="contained" size="large" fullWidth sx={{
              py: 1.75, fontSize: 16,
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
              '&:hover': { background: 'linear-gradient(135deg, #818cf8, #6366f1)' },
            }}>Enter Room</Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  // ── Shared panels ──────────────────────────────────────────────────────────
  const issuesPanel = (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
      <List sx={{ px: 1, py: 1, flexGrow: 1, overflowY: 'auto' }}>
        {issues.length === 0 && (
          <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">No issues yet.</Typography>
            <Typography variant="caption">Add one to get started.</Typography>
          </Box>
        )}
        {issues.map(issue => (
          <ListItem
            button
            key={issue.uid}
            onClick={() => issueItemOnClick(issue)}
            sx={{
              borderRadius: 2, mb: 0.5, px: 1.5, alignItems: 'flex-start',
              minHeight: isMobile ? 56 : 48,
              bgcolor: issue.is_current ? 'rgba(99,102,241,0.1)' : 'transparent',
              border: issue.is_current ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
              '&:hover': { bgcolor: 'rgba(148,163,184,0.05)' },
              '&:active': { bgcolor: 'rgba(99,102,241,0.15)' },
            }}
          >
            <Box sx={{ mt: 0.4, mr: 1.5, flexShrink: 0 }}>
              {issue.is_current
                ? <CheckCircleIcon sx={{ fontSize: 18, color: '#6366f1' }} />
                : <RadioButtonUncheckedIcon sx={{ fontSize: 18, color: '#475569' }} />
              }
            </Box>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{
                fontWeight: issue.is_current ? 600 : 400,
                color: issue.is_current ? '#f1f5f9' : 'text.secondary',
                lineHeight: 1.4, whiteSpace: 'normal',
              }}>{issue.title}</Typography>
              {issue.estimated_points && (
                <Chip label={issue.estimated_points} size="small" sx={{
                  mt: 0.5, height: 18, fontSize: 10,
                  bgcolor: 'rgba(16,185,129,0.15)', color: '#34d399',
                }} />
              )}
            </Box>
          </ListItem>
        ))}
      </List>
      <Box sx={{ p: 2 }}>
        <Fab
          color="primary"
          variant="extended"
          size="medium"
          onClick={() => setCreateIssueDialogOpen(true)}
          sx={{
            width: '100%',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
            '&:hover': { background: 'linear-gradient(135deg, #818cf8, #6366f1)' },
          }}
        >
          <AddIcon sx={{ mr: 1 }} />
          Add Issue
        </Fab>
      </Box>
    </Box>
  );

  const participantsPanel = (
    <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
      <Box sx={{ p: 2, pb: 1, display: 'flex', alignItems: 'center' }}>
        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 1.5 }}>
          Participants
        </Typography>
        <Chip label={participants.length} size="small"
          sx={{ ml: 1, bgcolor: 'rgba(99,102,241,0.15)', color: '#818cf8', height: 18, fontSize: 11 }} />
      </Box>
      <Divider sx={{ borderColor: 'rgba(148,163,184,0.08)' }} />
      <List sx={{ px: 1, py: 1, overflowY: 'auto', flexGrow: 1 }}>
        {participants.map(participant => {
          const isMe = myUid === participant.uid;
          const initials = participant.name.slice(0, 2).toUpperCase();
          return (
            <ListItem key={participant.uid} sx={{
              borderRadius: 2, mb: 0.5, px: 1.5,
              minHeight: isMobile ? 56 : 48,
              bgcolor: isMe ? 'rgba(99,102,241,0.08)' : 'transparent',
            }}>
              <Box sx={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0, mr: 1.5,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700,
                background: isMe ? 'linear-gradient(135deg, #6366f1, #818cf8)' : 'rgba(148,163,184,0.15)',
                color: isMe ? '#fff' : '#94a3b8',
              }}>{initials}</Box>
              <ListItemText
                primary={isMe ? `${participant.name} (you)` : participant.name}
                primaryTypographyProps={{ variant: 'body2', fontWeight: isMe ? 600 : 400, color: isMe ? '#f1f5f9' : 'text.secondary' }}
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  // ── MOBILE LAYOUT ──────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default' }}>
        <CssBaseline />

        <AppBar position="fixed" elevation={0} sx={{
          zIndex: t => t.zIndex.drawer + 1,
          bgcolor: 'rgba(15,23,42,0.95)', borderBottom: '1px solid rgba(148,163,184,0.08)', backdropFilter: 'blur(12px)',
        }}>
          <Toolbar sx={{ gap: 1.5, minHeight: '52px !important', px: 2 }}>
            <Box sx={{
              width: 28, height: 28, borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1, #818cf8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, userSelect: 'none', flexShrink: 0,
            }}>♠</Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#f1f5f9' }}>Planning Poker</Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Chip
              label={copied ? 'Copied!' : roomUid}
              size="small"
              onClick={handleCopyRoomId}
              icon={<ContentCopyIcon sx={{ fontSize: '12px !important', color: `${copied ? '#34d399' : '#818cf8'} !important` }} />}
              sx={{
                fontFamily: 'monospace', fontSize: 11, maxWidth: 130,
                bgcolor: copied ? 'rgba(16,185,129,0.12)' : 'rgba(99,102,241,0.12)',
                color: copied ? '#34d399' : '#818cf8',
                border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(99,102,241,0.3)'}`,
                fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              }}
            />
            <Tooltip title="Leave room">
              <IconButton size="small" onClick={handleExit} sx={{ color: '#f43f5e', ml: 0.5 }}>
                <ExitToAppIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        {/* Mobile content */}
        <Box sx={{ flexGrow: 1, overflow: 'hidden', mt: '52px', mb: 'calc(56px + env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column' }}>
          {mobileTab === 0 && <Board currentIssue={currentIssue} roomUid={roomUid} />}
          {mobileTab === 1 && (
            <Box sx={{ height: '100%', bgcolor: 'rgba(15,23,42,0.98)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {issuesPanel}
            </Box>
          )}
          {mobileTab === 2 && (
            <Box sx={{ height: '100%', bgcolor: 'rgba(15,23,42,0.98)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <Chat messages={chatMessages} onSend={handleSendChat} />
            </Box>
          )}
          {mobileTab === 3 && (
            <Box sx={{ height: '100%', bgcolor: 'rgba(15,23,42,0.98)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {participantsPanel}
            </Box>
          )}
        </Box>

        {/* Bottom Nav */}
        <Paper elevation={0} sx={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          zIndex: t => t.zIndex.appBar,
          bgcolor: 'rgba(15,23,42,0.97)',
          borderTop: '1px solid rgba(148,163,184,0.08)',
          backdropFilter: 'blur(12px)',
        }}>
          <BottomNavigation
            value={mobileTab}
            onChange={(_, v) => {
              setMobileTab(v);
              mobileTabRef.current = v;
              if (v === 2) setUnreadCount(0);
            }}
            sx={{ bgcolor: 'transparent', height: 56, pb: 'env(safe-area-inset-bottom)' }}
          >
            <BottomNavigationAction label="Board" icon={<DashboardIcon />}
              sx={{ color: '#475569', '&.Mui-selected': { color: '#818cf8' }, minWidth: 0, fontSize: 10 }} />
            <BottomNavigationAction label="Issues" icon={<FormatListBulletedIcon />}
              sx={{ color: '#475569', '&.Mui-selected': { color: '#818cf8' }, minWidth: 0, fontSize: 10 }} />
            <BottomNavigationAction
              label="Chat"
              icon={
                <Badge badgeContent={unreadCount} max={9}
                  sx={{ '& .MuiBadge-badge': { bgcolor: '#6366f1', color: '#fff', fontSize: 9, minWidth: 15, height: 15, top: 2, right: -2 } }}>
                  <ChatBubbleOutlineIcon />
                </Badge>
              }
              sx={{ color: '#475569', '&.Mui-selected': { color: '#818cf8' }, minWidth: 0, fontSize: 10 }}
            />
            <BottomNavigationAction
              label="People"
              icon={
                <Badge badgeContent={participants.length} max={99}
                  sx={{ '& .MuiBadge-badge': { bgcolor: 'rgba(99,102,241,0.8)', color: '#fff', fontSize: 9, minWidth: 15, height: 15, top: 2, right: -2 } }}>
                  <PeopleAltIcon />
                </Badge>
              }
              sx={{ color: '#475569', '&.Mui-selected': { color: '#818cf8' }, minWidth: 0, fontSize: 10 }}
            />
          </BottomNavigation>
        </Paper>

        <CreateIssueComponent
          createIssueDialogOpen={createIssueDialogOpen}
          handleClose={() => setCreateIssueDialogOpen(false)}
          handleCreateIssue={handleCreateIssue}
          handleIssueTitleInputChange={(e) => setIssueTitle(e.target.value)}
        />
      </Box>
    );
  }

  // ── DESKTOP LAYOUT ─────────────────────────────────────────────────────────
  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />

      <AppBar position="fixed" elevation={0} sx={{
        zIndex: t => t.zIndex.drawer + 1,
        bgcolor: 'rgba(15,23,42,0.95)', borderBottom: '1px solid rgba(148,163,184,0.08)', backdropFilter: 'blur(12px)',
      }}>
        <Toolbar sx={{ gap: 2 }}>
          <Box sx={{
            width: 32, height: 32, borderRadius: '8px',
            background: 'linear-gradient(135deg, #6366f1, #818cf8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, userSelect: 'none', flexShrink: 0,
          }}>♠</Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f1f5f9' }}>Planning Poker</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Room ID:</Typography>
          <Chip label={roomUid} size="small" sx={{
            fontFamily: 'monospace', bgcolor: 'rgba(99,102,241,0.12)',
            color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)', fontWeight: 600,
          }} />
          <Tooltip title={copied ? "Copied!" : "Copy Room ID"}>
            <IconButton size="small" onClick={handleCopyRoomId} sx={{ color: 'text.secondary' }}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Leave room">
            <IconButton size="small" onClick={handleExit} sx={{ color: '#f43f5e' }}>
              <ExitToAppIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent" sx={{
        width: drawerWidth, flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth, boxSizing: 'border-box',
          bgcolor: 'rgba(15,23,42,0.98)', borderRight: '1px solid rgba(148,163,184,0.08)',
        },
      }}>
        <Toolbar />
        {participantsPanel}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Toolbar />
        <Board currentIssue={currentIssue} roomUid={roomUid} />
      </Box>

      <Drawer variant="permanent" anchor="right" sx={{
        width: drawerWidth, flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth, boxSizing: 'border-box',
          bgcolor: 'rgba(15,23,42,0.98)', borderLeft: '1px solid rgba(148,163,184,0.08)',
          display: 'flex', flexDirection: 'column',
        },
      }}>
        <Toolbar />
        <Tabs
          value={rightTab}
          onChange={(_, v) => { setRightTab(v); rightTabRef.current = v; if (v === 1) setUnreadCount(0); }}
          sx={{
            minHeight: 44,
            borderBottom: '1px solid rgba(148,163,184,0.08)',
            '& .MuiTabs-indicator': { backgroundColor: '#6366f1' },
          }}
        >
          <Tab label="Issues" sx={{
            minHeight: 44, fontSize: 12, fontWeight: 600, textTransform: 'none', flex: 1,
            color: 'text.secondary', '&.Mui-selected': { color: '#818cf8' },
          }} />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                Chat
                {unreadCount > 0 && (
                  <Chip label={unreadCount} size="small" sx={{
                    height: 16, fontSize: 10, minWidth: 16,
                    bgcolor: '#6366f1', color: '#fff',
                    '& .MuiChip-label': { px: 0.5 },
                  }} />
                )}
              </Box>
            }
            sx={{
              minHeight: 44, fontSize: 12, fontWeight: 600, textTransform: 'none', flex: 1,
              color: 'text.secondary', '&.Mui-selected': { color: '#818cf8' },
            }}
          />
        </Tabs>

        {rightTab === 0 && issuesPanel}
        {rightTab === 1 && (
          <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Chat messages={chatMessages} onSend={handleSendChat} />
          </Box>
        )}

        <CreateIssueComponent
          createIssueDialogOpen={createIssueDialogOpen}
          handleClose={() => setCreateIssueDialogOpen(false)}
          handleCreateIssue={handleCreateIssue}
          handleIssueTitleInputChange={(e) => setIssueTitle(e.target.value)}
        />
      </Drawer>
    </Box>
  );
}

export default Room;
