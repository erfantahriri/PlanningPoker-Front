import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PendingIcon from '@mui/icons-material/Pending';
import PeopleIcon from '@mui/icons-material/People';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { getRoomSummary } from '../services/api';

function StatCard({ icon, value, label }) {
  return (
    <Box sx={{
      flex: 1, p: 2, borderRadius: 2, textAlign: 'center',
      bgcolor: 'rgba(30,41,59,0.5)', border: '1px solid rgba(148,163,184,0.08)',
    }}>
      <Box sx={{ color: '#6366f1', mb: 0.5 }}>{icon}</Box>
      <Typography variant="h5" sx={{ fontWeight: 700, color: '#f1f5f9', lineHeight: 1 }}>{value}</Typography>
      <Typography variant="caption" sx={{ color: '#475569' }}>{label}</Typography>
    </Box>
  );
}

function VoteBar({ votes }) {
  if (!votes || votes.length === 0) return null;

  // Count occurrences of each vote value
  const counts = {};
  votes.forEach(v => {
    const pt = v.estimated_points ?? '?';
    counts[pt] = (counts[pt] || 0) + 1;
  });
  const total = votes.length;
  const entries = Object.entries(counts).sort((a, b) => Number(a[0]) - Number(b[0]));

  return (
    <Box sx={{ mt: 1.5 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
        {votes.map(v => (
          <Tooltip key={v.uid} title={v.participant.name}>
            <Chip
              label={v.estimated_points ?? '?'}
              size="small"
              sx={{
                bgcolor: 'rgba(99,102,241,0.12)', color: '#818cf8',
                border: '1px solid rgba(99,102,241,0.25)',
                fontWeight: 700, fontFamily: 'monospace', fontSize: 12,
              }}
            />
          </Tooltip>
        ))}
      </Box>
      {entries.length > 1 && (
        <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
          {entries.map(([pt, count]) => (
            <Typography key={pt} variant="caption" sx={{ color: '#475569' }}>
              <span style={{ color: '#818cf8', fontWeight: 700 }}>{pt}</span>
              {' '}× {count} ({Math.round(count / total * 100)}%)
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
}

function RoomSummary() {
  const { roomUid } = useParams();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getRoomSummary(roomUid)
      .then(data => { if (data) setSummary(data); })
      .finally(() => setLoading(false));
  }, [roomUid]);

  const handleCopy = () => {
    if (!summary) return;
    const estimated = summary.issues.filter(i => i.estimated_points);
    const lines = [
      `# ${summary.title} — Session Summary`,
      ``,
      `**Participants:** ${summary.participants.filter(p => p.role === 'voter').length} voters`,
      `**Issues estimated:** ${estimated.length} / ${summary.issues.length}`,
      ``,
      `## Issues`,
      ``,
      ...summary.issues.map(issue => {
        const est = issue.estimated_points ? `**${issue.estimated_points} pts**` : '_Not estimated_';
        const voteStr = issue.vote_cards_status === 'visible' && issue.votes.length > 0
          ? ` — Votes: ${issue.votes.map(v => `${v.participant.name}: ${v.estimated_points}`).join(', ')}`
          : '';
        return `- ${issue.title} → ${est}${voteStr}`;
      }),
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const estimatedCount = summary?.issues.filter(i => i.estimated_points).length ?? 0;
  const voterCount = summary?.participants.filter(p => p.role === 'voter').length ?? 0;

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      px: 2, py: 6,
    }}>
      <Box sx={{ width: '100%', maxWidth: 720 }}>

        {/* Top nav */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/rooms/${roomUid}`)}
            sx={{ color: '#475569', '&:hover': { color: '#818cf8' } }}
          >
            Back to Room
          </Button>
          <Box
            component={Link}
            to="/"
            sx={{
              width: 32, height: 32, borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1, #818cf8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, userSelect: 'none', textDecoration: 'none', cursor: 'pointer',
              boxShadow: '0 0 20px rgba(99,102,241,0.35)',
              '&:hover': { transform: 'scale(1.08)' }, transition: 'transform 0.15s',
            }}
          >♠</Box>
        </Box>

        {/* Header */}
        {loading ? (
          <>
            <Skeleton variant="text" width="50%" height={40} sx={{ bgcolor: 'rgba(148,163,184,0.1)', mb: 1 }} />
            <Skeleton variant="text" width="30%" height={20} sx={{ bgcolor: 'rgba(148,163,184,0.07)' }} />
          </>
        ) : (
          <>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#f1f5f9', mb: 0.5 }}>
              {summary?.title}
            </Typography>
            {summary?.description && (
              <Typography variant="body1" sx={{ color: '#64748b', mb: 0 }}>
                {summary.description}
              </Typography>
            )}
          </>
        )}

        <Divider sx={{ borderColor: 'rgba(148,163,184,0.08)', my: 3 }} />

        {/* Stats row */}
        {loading ? (
          <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            {[1, 2, 3].map(i => (
              <Skeleton key={i} variant="rounded" height={80} sx={{ flex: 1, bgcolor: 'rgba(148,163,184,0.08)', borderRadius: 2 }} />
            ))}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            <StatCard icon={<TaskAltIcon />} value={estimatedCount} label="Estimated" />
            <StatCard icon={<PendingIcon />} value={(summary?.issues.length ?? 0) - estimatedCount} label="Pending" />
            <StatCard icon={<PeopleIcon />} value={voterCount} label="Voters" />
          </Box>
        )}

        {/* Issues list */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 1.5 }}>
            Issues
          </Typography>
          {!loading && summary && (
            <Button
              size="small"
              startIcon={<ContentCopyIcon sx={{ fontSize: 14 }} />}
              onClick={handleCopy}
              sx={{
                fontSize: 12,
                color: copied ? '#10b981' : '#475569',
                '&:hover': { color: copied ? '#10b981' : '#818cf8' },
              }}
            >
              {copied ? 'Copied!' : 'Copy as Markdown'}
            </Button>
          )}
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} variant="rounded" height={72} sx={{ bgcolor: 'rgba(148,163,184,0.08)', borderRadius: 2 }} />
            ))}
          </Box>
        )}

        {!loading && summary?.issues.length === 0 && (
          <Box sx={{
            py: 6, textAlign: 'center', borderRadius: 3,
            bgcolor: 'rgba(30,41,59,0.4)', border: '1px solid rgba(148,163,184,0.08)',
          }}>
            <Typography variant="body1" sx={{ color: '#475569' }}>No issues in this room yet.</Typography>
          </Box>
        )}

        {!loading && summary?.issues.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {summary.issues.map(issue => {
              const isEstimated = !!issue.estimated_points;
              const votesVisible = issue.vote_cards_status === 'visible';
              return (
                <Paper
                  key={issue.uid}
                  elevation={0}
                  sx={{
                    p: 2.5,
                    bgcolor: 'rgba(30,41,59,0.5)',
                    border: isEstimated
                      ? '1px solid rgba(16,185,129,0.2)'
                      : '1px solid rgba(148,163,184,0.08)',
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {isEstimated
                          ? <CheckCircleIcon sx={{ fontSize: 16, color: '#10b981', flexShrink: 0 }} />
                          : <PendingIcon sx={{ fontSize: 16, color: '#475569', flexShrink: 0 }} />
                        }
                        <Typography variant="body1" sx={{ fontWeight: 600, color: isEstimated ? '#f1f5f9' : '#64748b' }}>
                          {issue.title}
                        </Typography>
                      </Box>
                      {votesVisible && <VoteBar votes={issue.votes} />}
                    </Box>
                    <Box sx={{ flexShrink: 0, textAlign: 'right' }}>
                      {isEstimated ? (
                        <Box sx={{
                          px: 2, py: 0.75, borderRadius: 2,
                          bgcolor: 'rgba(16,185,129,0.12)',
                          border: '1px solid rgba(16,185,129,0.3)',
                        }}>
                          <Typography variant="h6" sx={{ fontWeight: 800, color: '#10b981', lineHeight: 1 }}>
                            {issue.estimated_points}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#059669' }}>pts</Typography>
                        </Box>
                      ) : (
                        <Typography variant="caption" sx={{ color: '#334155' }}>—</Typography>
                      )}
                    </Box>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        )}

        {/* Participants */}
        {!loading && summary?.participants.length > 0 && (
          <>
            <Divider sx={{ borderColor: 'rgba(148,163,184,0.08)', my: 3 }} />
            <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 1.5, display: 'block', mb: 1.5 }}>
              Participants
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {summary.participants.map(p => (
                <Chip
                  key={p.uid}
                  label={`${p.role === 'spectator' ? '👁 ' : '🃏 '}${p.name}`}
                  size="small"
                  sx={{
                    bgcolor: p.role === 'spectator' ? 'rgba(71,85,105,0.2)' : 'rgba(99,102,241,0.12)',
                    color: p.role === 'spectator' ? '#64748b' : '#818cf8',
                    border: `1px solid ${p.role === 'spectator' ? 'rgba(71,85,105,0.2)' : 'rgba(99,102,241,0.25)'}`,
                  }}
                />
              ))}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}

export default RoomSummary;
