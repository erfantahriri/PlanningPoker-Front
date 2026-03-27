import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getRoomIssues, getRoomParticipants, createIssue,
  getRoomCurrentIssue, setRoomCurrentIssue, joinRoom, getRoomInfo,
  deleteIssue, updateIssue, renameParticipant, updateRoom, updateParticipant
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
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
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
import AssessmentIcon from '@mui/icons-material/Assessment';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import VisibilityIcon from '@mui/icons-material/Visibility';
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
const CARD_SET_LABELS = { standard: '🎯 Standard', fibonacci: '🌀 Fibonacci', tshirt: '👕 T-Shirt' };
const CARD_SETS_LIST = [
  { value: 'standard', label: '🎯 Standard' },
  { value: 'fibonacci', label: '🌀 Fibonacci' },
  { value: 'tshirt', label: '👕 T-Shirt' },
];

const ROLES = [
  { value: 'dev',      emoji: '🧑‍💻', label: 'Dev',      desc: 'Estimates story points',  canVote: true  },
  { value: 'designer', emoji: '🎨', label: 'Designer', desc: 'Estimates design tasks',   canVote: true  },
  { value: 'pm',       emoji: '📋', label: 'PM',       desc: 'Facilitates, watch only',  canVote: false },
  { value: 'em',       emoji: '👔', label: 'EM',       desc: 'Observes, watch only',     canVote: false },
];
// include legacy values so existing participants render correctly
const ROLE_META = {
  dev:       { emoji: '🧑‍💻', label: 'Dev',      canVote: true  },
  designer:  { emoji: '🎨', label: 'Designer', canVote: true  },
  pm:        { emoji: '📋', label: 'PM',       canVote: false },
  em:        { emoji: '👔', label: 'EM',       canVote: false },
  voter:     { emoji: '🃏', label: 'Voter',    canVote: true  },
  spectator: { emoji: '👁', label: 'Spectator',canVote: false },
};

function Room() {
  const { roomUid } = useParams();
  const navigate = useNavigate();
  const ws = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [joined, setJoined] = useState(
    !!localStorage.getItem('accessToken') && localStorage.getItem('roomUid') === roomUid
  );
  const [roomInfo, setRoomInfo] = useState(null);
  const [nameInput, setNameInput] = useState('');
  const [roleInput, setRoleInput] = useState('dev');
  const [passwordInput, setPasswordInput] = useState('');
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
  const [editingIssueUid, setEditingIssueUid] = useState(null);
  const [editingIssueTitle, setEditingIssueTitle] = useState('');
  const [editingMyName, setEditingMyName] = useState(false);
  const [myNameInput, setMyNameInput] = useState('');
  const [timerState, setTimerState] = useState(null); // { duration, startedAt }
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [reactions, setReactions] = useState([]);
  const [editingRoomTitle, setEditingRoomTitle] = useState(false);
  const [roomTitleInput, setRoomTitleInput] = useState('');
  const [cardSetMenuAnchor, setCardSetMenuAnchor] = useState(null);
  const [roleMenuAnchor, setRoleMenuAnchor] = useState(null);
  const [roleMenuTarget, setRoleMenuTarget] = useState(null); // participant uid
  const rightTabRef = useRef(0);
  const mobileTabRef = useRef(0);

  useEffect(() => {
    getRoomInfo(roomUid).then(info => { if (info) setRoomInfo(info); });
  }, [roomUid]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    joinRoom(roomUid, nameInput.trim(), roleInput, passwordInput)
      .then(data => {
        if (data) {
          localStorage.setItem('accessToken', data.access_token);
          localStorage.setItem('userUid', data.uid);
          localStorage.setItem('userName', nameInput.trim());
          localStorage.setItem('userRole', roleInput);
          localStorage.setItem('roomUid', roomUid);
          setJoined(true);
        } else {
          toastr.error('Room not found or something went wrong.');
        }
      })
      .catch(err => toastr.error(typeof err === 'string' ? err : 'Could not join room.'));
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
    localStorage.removeItem('userRole');
    localStorage.removeItem('roomUid');
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

  useEffect(() => {
    if (!timerState) return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - new Date(timerState.startedAt)) / 1000);
      const remaining = timerState.duration - elapsed;
      if (remaining <= 0) {
        setRemainingSeconds(0);
        setTimerState(null);
        clearInterval(interval);
      } else {
        setRemainingSeconds(remaining);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [timerState]);

  const handleTimerStart = (duration) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    ws.current.send(JSON.stringify({ type: 'timer_start', content: { duration } }));
  };

  const handleTimerStop = () => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    ws.current.send(JSON.stringify({ type: 'timer_stop', content: {} }));
  };

  const handleReaction = (emoji) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    ws.current.send(JSON.stringify({
      type: 'reaction',
      content: {
        participantName: localStorage.getItem('userName') || '',
        emoji,
      },
    }));
  };

  const handleDeleteIssue = (e, issueUid) => {
    e.stopPropagation();
    deleteIssue(roomUid, issueUid)
      .then(res => {
        if (res) setIssues(prev => prev.filter(i => i.uid !== issueUid));
        else toastr.error('Could not delete issue.');
      });
  };

  const handleStartRenameIssue = (e, issue) => {
    e.stopPropagation();
    setEditingIssueUid(issue.uid);
    setEditingIssueTitle(issue.title);
  };

  const handleSaveRenameIssue = (issue) => {
    if (!editingIssueTitle.trim() || editingIssueTitle === issue.title) {
      setEditingIssueUid(null);
      return;
    }
    updateIssue(roomUid, issue.uid, editingIssueTitle.trim(), issue.estimated_points)
      .then(data => {
        if (data) setIssues(prev => prev.map(i => i.uid === data.uid ? data : i));
        setEditingIssueUid(null);
      });
  };

  const handleSaveMyName = () => {
    const trimmed = myNameInput.trim();
    if (!trimmed) { setEditingMyName(false); return; }
    const myUidLocal = localStorage.getItem('userUid');
    renameParticipant(roomUid, myUidLocal, trimmed)
      .then(data => {
        if (data) {
          localStorage.setItem('userName', trimmed);
          setParticipants(prev => prev.map(p => p.uid === myUidLocal ? { ...p, name: trimmed } : p));
        }
        setEditingMyName(false);
      });
  };

  const handleSaveRoomTitle = () => {
    const trimmed = roomTitleInput.trim();
    if (!trimmed || trimmed === roomInfo?.title) { setEditingRoomTitle(false); return; }
    updateRoom(roomUid, { title: trimmed }).then(data => {
      if (data) setRoomInfo(prev => ({ ...prev, title: data.title }));
      setEditingRoomTitle(false);
    });
  };

  const handleChangeCardSet = (cardSet) => {
    setCardSetMenuAnchor(null);
    if (cardSet === roomInfo?.card_set) return;
    updateRoom(roomUid, { card_set: cardSet }).then(data => {
      if (data) setRoomInfo(prev => ({ ...prev, card_set: data.card_set }));
    });
  };

  const handleChangeRole = (participantUid, newRole) => {
    setRoleMenuAnchor(null);
    setRoleMenuTarget(null);
    // optimistic update
    setParticipants(prev => prev.map(p => p.uid === participantUid ? { ...p, role: newRole } : p));
    const myUidNow = localStorage.getItem('userUid');
    if (participantUid === myUidNow) localStorage.setItem('userRole', newRole);
    updateParticipant(roomUid, participantUid, { role: newRole }).then(data => {
      if (data) {
        setParticipants(prev => prev.map(p => p.uid === participantUid ? { ...p, role: data.role } : p));
        if (participantUid === myUidNow) localStorage.setItem('userRole', data.role);
      }
    });
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
          case "rename_participant":
            setParticipants(prev => prev.map(p => p.uid === message.content.uid ? { ...p, name: message.content.name } : p));
            break;
          case "update_participant":
            setParticipants(prev => prev.map(p => p.uid === message.content.uid ? { ...p, ...message.content } : p));
            if (message.content.uid === localStorage.getItem('userUid')) {
              localStorage.setItem('userRole', message.content.role);
            }
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
          case "timer_start":
            setTimerState({ duration: message.content.duration, startedAt: message.content.started_at });
            setRemainingSeconds(message.content.duration);
            break;
          case "timer_stop":
            setTimerState(null);
            setRemainingSeconds(0);
            break;
          case "reaction":
            const reaction = { ...message.content, _key: message.content.id };
            setReactions(prev => [...prev, reaction]);
            setTimeout(() => setReactions(prev => prev.filter(r => r._key !== reaction._key)), 3000);
            break;
          case "update_room":
            setRoomInfo(prev => prev ? { ...prev, ...message.content } : message.content);
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
  const myRole = participants.find(p => p.uid === myUid)?.role ?? localStorage.getItem('userRole');

  // ── Join screen ────────────────────────────────────────────────────────────
  if (!joined) {
    return (
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 2,
      }}>
        <Box
          onClick={() => navigate('/')}
          sx={{
            width: 40, height: 40, borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1, #818cf8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, userSelect: 'none', mb: 3, cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
            transition: 'transform 0.15s, box-shadow 0.15s',
            '&:hover': { transform: 'scale(1.08)', boxShadow: '0 8px 40px rgba(99,102,241,0.6)' },
          }}
        >♠</Box>
        <Paper elevation={0} sx={{
          p: { xs: 3, sm: 4 }, width: '100%', maxWidth: 420,
          background: 'rgba(30,41,59,0.85)', border: '1px solid rgba(148,163,184,0.1)',
          backdropFilter: 'blur(12px)', borderRadius: 3,
        }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            {roomInfo?.is_private ? '🔒 ' : ''}Join Room
          </Typography>
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
            {/* Role picker */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
              {ROLES.map(opt => (
                <Box
                  key={opt.value}
                  onClick={() => setRoleInput(opt.value)}
                  sx={{
                    p: 1.5, borderRadius: 2, cursor: 'pointer',
                    border: roleInput === opt.value
                      ? '2px solid #6366f1'
                      : '1px solid rgba(148,163,184,0.15)',
                    bgcolor: roleInput === opt.value
                      ? 'rgba(99,102,241,0.1)'
                      : 'rgba(15,23,42,0.4)',
                    transition: 'all 0.15s',
                    '&:active': { transform: 'scale(0.98)' },
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 700, color: roleInput === opt.value ? '#818cf8' : '#94a3b8' }}>
                    {opt.emoji} {opt.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#475569', lineHeight: 1.3, display: 'block', mt: 0.25 }}>
                    {opt.desc}
                  </Typography>
                </Box>
              ))}
            </Box>
            {roomInfo?.is_private && (
              <TextField
                label="Room Password" variant="outlined" required fullWidth type="password"
                value={passwordInput} onChange={e => setPasswordInput(e.target.value)}
                inputProps={{ style: { fontSize: 16 } }}
                sx={{ '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(148,163,184,0.2)' },
                  '&:hover fieldset': { borderColor: 'rgba(99,102,241,0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                }}}
              />
            )}
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
            key={issue.uid}
            onClick={() => editingIssueUid !== issue.uid && issueItemOnClick(issue)}
            sx={{
              borderRadius: 2, mb: 0.5, px: 1.5, alignItems: 'flex-start',
              minHeight: isMobile ? 56 : 48,
              bgcolor: issue.is_current ? 'rgba(99,102,241,0.1)' : 'transparent',
              border: issue.is_current ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
              cursor: editingIssueUid === issue.uid ? 'default' : 'pointer',
              '&:hover': { bgcolor: editingIssueUid === issue.uid ? undefined : 'rgba(148,163,184,0.05)' },
              '&:hover .issue-actions': { opacity: 1 },
            }}
          >
            <Box sx={{ mt: 0.4, mr: 1.5, flexShrink: 0 }}>
              {issue.is_current
                ? <CheckCircleIcon sx={{ fontSize: 18, color: '#6366f1' }} />
                : <RadioButtonUncheckedIcon sx={{ fontSize: 18, color: '#475569' }} />
              }
            </Box>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              {editingIssueUid === issue.uid ? (
                <TextField
                  autoFocus
                  size="small"
                  fullWidth
                  value={editingIssueTitle}
                  onChange={e => setEditingIssueTitle(e.target.value)}
                  onBlur={() => handleSaveRenameIssue(issue)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSaveRenameIssue(issue);
                    if (e.key === 'Escape') setEditingIssueUid(null);
                  }}
                  onClick={e => e.stopPropagation()}
                  inputProps={{ style: { fontSize: 13 } }}
                  sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(99,102,241,0.5)' } } }}
                />
              ) : (
                <>
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
                </>
              )}
            </Box>
            {editingIssueUid !== issue.uid && (
              <Box className="issue-actions" sx={{ display: 'flex', gap: 0.25, opacity: isMobile ? 1 : 0, transition: 'opacity 0.15s', flexShrink: 0 }}>
                <IconButton size="small" onClick={e => handleStartRenameIssue(e, issue)} sx={{ color: '#475569', '&:hover': { color: '#818cf8' } }}>
                  <EditIcon sx={{ fontSize: 14 }} />
                </IconButton>
                <IconButton size="small" onClick={e => handleDeleteIssue(e, issue.uid)} sx={{ color: '#475569', '&:hover': { color: '#f43f5e' } }}>
                  <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            )}
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
          const isVoter = ROLE_META[participant.role]?.canVote ?? true;
          const votingActive = !!currentIssue && currentIssue.vote_cards_status === 'hidden';
          const hasVoted = votingActive && isVoter &&
            (currentIssue.votes ?? []).some(v => v.participant.uid === participant.uid);
          const waitingToVote = votingActive && isVoter && !hasVoted;
          return (
            <ListItem key={participant.uid} sx={{
              borderRadius: 2, mb: 0.5, px: 1.5,
              minHeight: isMobile ? 56 : 48,
              bgcolor: isMe ? 'rgba(99,102,241,0.08)' : 'transparent',
            }}>
              {/* Avatar with vote-status dot */}
              <Box sx={{ position: 'relative', flexShrink: 0, mr: 1.5 }}>
                <Box sx={{
                  width: 36, height: 36, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700,
                  background: isMe ? 'linear-gradient(135deg, #6366f1, #818cf8)' : 'rgba(148,163,184,0.15)',
                  color: isMe ? '#fff' : '#94a3b8',
                }}>{initials}</Box>
                {(hasVoted || waitingToVote) && (
                  <Tooltip title={hasVoted ? 'Voted' : 'Waiting…'}>
                    <Box sx={{
                      position: 'absolute', bottom: 0, right: 0,
                      width: 10, height: 10, borderRadius: '50%',
                      bgcolor: hasVoted ? '#10b981' : '#f59e0b',
                      border: '2px solid #0f172a',
                    }} />
                  </Tooltip>
                )}
              </Box>
              {isMe && editingMyName ? (
                <TextField
                  autoFocus
                  size="small"
                  value={myNameInput}
                  onChange={e => setMyNameInput(e.target.value)}
                  onBlur={handleSaveMyName}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSaveMyName();
                    if (e.key === 'Escape') setEditingMyName(false);
                  }}
                  inputProps={{ style: { fontSize: 13 } }}
                  sx={{
                    flexGrow: 1, mr: 1,
                    '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(99,102,241,0.5)' } }
                  }}
                />
              ) : (
                <ListItemText
                  primary={isMe ? `${participant.name} (you)` : participant.name}
                  primaryTypographyProps={{ variant: 'body2', fontWeight: isMe ? 600 : 400, color: isMe ? '#f1f5f9' : 'text.secondary' }}
                />
              )}
              {isMe && !editingMyName && (
                <IconButton
                  size="small"
                  onClick={() => { setMyNameInput(participant.name); setEditingMyName(true); }}
                  sx={{ color: '#334155', '&:hover': { color: '#818cf8' }, mr: 0.5, flexShrink: 0 }}
                >
                  <EditIcon sx={{ fontSize: 13 }} />
                </IconButton>
              )}
              <Chip
                label={`${ROLE_META[participant.role]?.emoji ?? '🃏'} ${ROLE_META[participant.role]?.label ?? participant.role}`}
                size="small"
                onClick={e => { setRoleMenuAnchor(e.currentTarget); setRoleMenuTarget(participant.uid); }}
                sx={{
                  height: 20, fontSize: 10, fontWeight: 600, flexShrink: 0, cursor: 'pointer',
                  bgcolor: ROLE_META[participant.role]?.canVote
                    ? 'rgba(99,102,241,0.12)' : 'rgba(148,163,184,0.08)',
                  color: ROLE_META[participant.role]?.canVote ? '#818cf8' : '#64748b',
                  border: ROLE_META[participant.role]?.canVote
                    ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(148,163,184,0.12)',
                  '& .MuiChip-label': { px: 0.75 },
                  '&:hover': { opacity: 0.8 },
                }}
              />
            </ListItem>
          );
        })}
      </List>
      <Menu
        anchorEl={roleMenuAnchor}
        open={Boolean(roleMenuAnchor)}
        onClose={() => { setRoleMenuAnchor(null); setRoleMenuTarget(null); }}
        PaperProps={{ sx: { bgcolor: '#1e293b', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 2, minWidth: 160 } }}
      >
        <Typography variant="caption" sx={{ px: 2, pt: 1, pb: 0.5, display: 'block', color: '#475569', fontWeight: 600, letterSpacing: 1 }}>
          CHANGE ROLE
        </Typography>
        {ROLES.map(r => {
          const current = participants.find(p => p.uid === roleMenuTarget)?.role;
          return (
            <MenuItem key={r.value} onClick={() => handleChangeRole(roleMenuTarget, r.value)}
              sx={{
                fontSize: 13, gap: 1,
                color: current === r.value ? '#818cf8' : '#94a3b8',
                fontWeight: current === r.value ? 700 : 400,
                '&:hover': { bgcolor: 'rgba(99,102,241,0.1)', color: '#818cf8' },
              }}>
              <span>{r.emoji}</span>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 'inherit', color: 'inherit', lineHeight: 1.2 }}>{r.label}</Typography>
                <Typography variant="caption" sx={{ color: r.canVote ? '#6366f1' : '#475569', fontSize: 10 }}>{r.canVote ? 'votes' : 'watches'}</Typography>
              </Box>
            </MenuItem>
          );
        })}
      </Menu>
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
            <Box
              onClick={() => navigate('/')}
              sx={{
                width: 28, height: 28, borderRadius: '8px',
                background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, userSelect: 'none', flexShrink: 0, cursor: 'pointer',
              }}
            >♠</Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#f1f5f9', cursor: 'pointer' }} onClick={() => navigate('/')}>Planning Poker</Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Chip
              label={CARD_SET_LABELS[roomInfo?.card_set] ?? '🎯 Standard'}
              size="small"
              onClick={e => setCardSetMenuAnchor(e.currentTarget)}
              sx={{
                height: 22, fontSize: 10, flexShrink: 0,
                bgcolor: 'rgba(99,102,241,0.12)', color: '#818cf8',
                border: '1px solid rgba(99,102,241,0.3)', cursor: 'pointer',
                '& .MuiChip-label': { px: 0.75 },
              }}
            />
            <Menu
              anchorEl={cardSetMenuAnchor}
              open={Boolean(cardSetMenuAnchor)}
              onClose={() => setCardSetMenuAnchor(null)}
              PaperProps={{ sx: { bgcolor: '#1e293b', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 2 } }}
            >
              {CARD_SETS_LIST.map(cs => (
                <MenuItem key={cs.value} onClick={() => handleChangeCardSet(cs.value)}
                  sx={{
                    fontSize: 13, color: roomInfo?.card_set === cs.value ? '#818cf8' : '#94a3b8',
                    fontWeight: roomInfo?.card_set === cs.value ? 700 : 400,
                    '&:hover': { bgcolor: 'rgba(99,102,241,0.1)', color: '#818cf8' },
                  }}>
                  {cs.label}
                </MenuItem>
              ))}
            </Menu>
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
            <Tooltip title="Session summary">
              <IconButton size="small" onClick={() => navigate(`/rooms/${roomUid}/summary`)} sx={{ color: '#475569', '&:hover': { color: '#818cf8' } }}>
                <AssessmentIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Leave room">
              <IconButton size="small" onClick={handleExit} sx={{ color: '#f43f5e', ml: 0.5 }}>
                <ExitToAppIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        {/* Mobile content */}
        <Box sx={{ flexGrow: 1, overflow: 'hidden', mt: '52px', mb: 'calc(56px + env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column' }}>
          {mobileTab === 0 && (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Room title header */}
              <Box sx={{ px: 2, pt: 1.5, pb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                {editingRoomTitle ? (
                  <TextField
                    autoFocus size="small" fullWidth
                    value={roomTitleInput}
                    onChange={e => setRoomTitleInput(e.target.value)}
                    onBlur={handleSaveRoomTitle}
                    onKeyDown={e => { if (e.key === 'Enter') handleSaveRoomTitle(); if (e.key === 'Escape') setEditingRoomTitle(false); }}
                    inputProps={{ style: { fontSize: 15, fontWeight: 700, color: '#f1f5f9' } }}
                    sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(99,102,241,0.5)' } } }}
                  />
                ) : (
                  <>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#f1f5f9', fontSize: '1.1rem', flexGrow: 1, lineHeight: 1.3 }}>
                      {roomInfo?.title || '…'}
                    </Typography>
                    <Tooltip title="Rename room">
                      <IconButton size="small" onClick={() => { setRoomTitleInput(roomInfo?.title || ''); setEditingRoomTitle(true); }} sx={{ color: '#334155', '&:hover': { color: '#818cf8' }, flexShrink: 0 }}>
                        <EditIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </Box>
              <Board currentIssue={currentIssue} roomUid={roomUid} cardSet={roomInfo?.card_set} myRole={myRole} timerActive={!!timerState} remainingSeconds={remainingSeconds} onTimerStart={handleTimerStart} onTimerStop={handleTimerStop} reactions={reactions} onReaction={handleReaction} />
            </Box>
          )}
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
          <Box
            onClick={() => navigate('/')}
            sx={{
              width: 32, height: 32, borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1, #818cf8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, userSelect: 'none', flexShrink: 0, cursor: 'pointer',
            }}
          >♠</Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f1f5f9', cursor: 'pointer' }} onClick={() => navigate('/')}>Planning Poker</Typography>
          <Chip
            label={CARD_SET_LABELS[roomInfo?.card_set] ?? '🎯 Standard'}
            size="small"
            onClick={e => setCardSetMenuAnchor(e.currentTarget)}
            sx={{
              height: 24, fontSize: 11,
              bgcolor: 'rgba(99,102,241,0.12)', color: '#818cf8',
              border: '1px solid rgba(99,102,241,0.3)', cursor: 'pointer',
              '& .MuiChip-label': { px: 1 },
            }}
          />
          <Menu
            anchorEl={cardSetMenuAnchor}
            open={Boolean(cardSetMenuAnchor)}
            onClose={() => setCardSetMenuAnchor(null)}
            PaperProps={{ sx: { bgcolor: '#1e293b', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 2 } }}
          >
            {CARD_SETS_LIST.map(cs => (
              <MenuItem key={cs.value} onClick={() => handleChangeCardSet(cs.value)}
                sx={{
                  fontSize: 13, color: roomInfo?.card_set === cs.value ? '#818cf8' : '#94a3b8',
                  fontWeight: roomInfo?.card_set === cs.value ? 700 : 400,
                  '&:hover': { bgcolor: 'rgba(99,102,241,0.1)', color: '#818cf8' },
                }}>
                {cs.label}
              </MenuItem>
            ))}
          </Menu>
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
          <Tooltip title="Session summary">
            <IconButton size="small" onClick={() => navigate(`/rooms/${roomUid}/summary`)} sx={{ color: '#475569', '&:hover': { color: '#818cf8' } }}>
              <AssessmentIcon fontSize="small" />
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
        {/* Room title header */}
        <Box sx={{
          px: 3, py: 1.5,
          borderBottom: '1px solid rgba(148,163,184,0.06)',
          display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0,
        }}>
          {editingRoomTitle ? (
            <TextField
              autoFocus size="small"
              value={roomTitleInput}
              onChange={e => setRoomTitleInput(e.target.value)}
              onBlur={handleSaveRoomTitle}
              onKeyDown={e => { if (e.key === 'Enter') handleSaveRoomTitle(); if (e.key === 'Escape') setEditingRoomTitle(false); }}
              inputProps={{ style: { fontSize: 16, fontWeight: 700, color: '#f1f5f9' } }}
              sx={{
                minWidth: 240,
                '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(99,102,241,0.5)' } }
              }}
            />
          ) : (
            <>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#f1f5f9', fontSize: '1.1rem', lineHeight: 1 }}>
                {roomInfo?.title || '…'}
              </Typography>
              <Tooltip title="Rename room">
                <IconButton size="small" onClick={() => { setRoomTitleInput(roomInfo?.title || ''); setEditingRoomTitle(true); }} sx={{ color: '#334155', '&:hover': { color: '#818cf8' } }}>
                  <EditIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
        <Board currentIssue={currentIssue} roomUid={roomUid} cardSet={roomInfo?.card_set} myRole={myRole} timerActive={!!timerState} remainingSeconds={remainingSeconds} onTimerStart={handleTimerStart} onTimerStop={handleTimerStop} reactions={reactions} onReaction={handleReaction} />
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
