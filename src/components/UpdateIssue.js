import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

function UpdateIssue(props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      open={props.updateIssueDialogOpen}
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          bgcolor: '#1e293b',
          border: fullScreen ? 'none' : '1px solid rgba(148,163,184,0.1)',
          borderRadius: fullScreen ? 0 : 3,
          minWidth: fullScreen ? 'unset' : 400,
          m: fullScreen ? 0 : 2,
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Update Issue</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Set the final story point estimate.
        </Typography>
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label="Estimated Points"
          variant="outlined"
          onChange={props.handleEstimatedPointsChange}
          inputProps={{ style: { fontSize: 16 } }}
          sx={{
            mt: 1,
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: 'rgba(148,163,184,0.2)' },
              '&:hover fieldset': { borderColor: 'rgba(99,102,241,0.5)' },
              '&.Mui-focused fieldset': { borderColor: '#6366f1' },
            },
          }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={props.handleUpdateIssueDialogClose}
          sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'rgba(148,163,184,0.08)' } }}
        >
          Cancel
        </Button>
        <Button
          onClick={props.handleUpdateIssue}
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
            '&:hover': { background: 'linear-gradient(135deg, #34d399, #10b981)' },
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default UpdateIssue;
