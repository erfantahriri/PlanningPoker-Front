import React, { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';
import SendIcon from '@mui/icons-material/Send';

function Chat({ messages, onSend }) {
  const [text, setText] = useState('');
  const bottomRef = useRef(null);
  const myUid = localStorage.getItem('userUid');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Message List */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 1.5, py: 1,
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
        '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(148,163,184,0.2)', borderRadius: 2 },
      }}>
        {messages.length === 0 && (
          <Box sx={{ textAlign: 'center', mt: 6, color: 'text.secondary' }}>
            <Typography variant="body2">No messages yet.</Typography>
            <Typography variant="caption">Say something to the team!</Typography>
          </Box>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.senderUid === myUid;
          return (
            <Box
              key={i}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isMe ? 'flex-end' : 'flex-start',
                mb: 1.5,
              }}
            >
              {!isMe && (
                <Typography variant="caption" sx={{ color: '#6366f1', fontWeight: 600, mb: 0.3, px: 0.5 }}>
                  {msg.sender}
                </Typography>
              )}
              <Box
                sx={{
                  maxWidth: '85%',
                  px: 1.5, py: 1,
                  borderRadius: isMe ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                  bgcolor: isMe ? 'rgba(99,102,241,0.2)' : 'rgba(30,41,59,0.8)',
                  border: isMe ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(148,163,184,0.1)',
                  wordBreak: 'break-word',
                }}
              >
                <Typography variant="body2" sx={{ color: '#f1f5f9', lineHeight: 1.5 }}>
                  {msg.text}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#475569', mt: 0.3, px: 0.5 }}>
                {formatTime(msg.timestamp)}
              </Typography>
            </Box>
          );
        })}
        <div ref={bottomRef} />
      </Box>

      {/* Input */}
      <Box
        sx={{
          m: 1.5,
          display: 'flex',
          alignItems: 'center',
          bgcolor: 'rgba(30,41,59,0.8)',
          border: '1px solid rgba(148,163,184,0.15)',
          borderRadius: 3,
          px: 1.5,
          '&:focus-within': { border: '1px solid rgba(99,102,241,0.5)' },
        }}
      >
        <InputBase
          fullWidth
          multiline
          maxRows={3}
          placeholder="Message..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{ fontSize: 14, color: '#f1f5f9', py: 1,
            '& ::placeholder': { color: '#475569' },
          }}
        />
        <IconButton
          size="small"
          onClick={handleSend}
          disabled={!text.trim()}
          sx={{
            color: text.trim() ? '#6366f1' : '#334155',
            transition: 'color 0.2s',
          }}
        >
          <SendIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}

export default Chat;
