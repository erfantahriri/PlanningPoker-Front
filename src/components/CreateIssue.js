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

function CreateIssue(props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      open={props.createIssueDialogOpen}
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
        <Typography variant="h6" sx={{ fontWeight: 700 }}>New Issue</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Add a story or task to estimate.
        </Typography>
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label="Issue Title"
          variant="outlined"
          onChange={props.handleIssueTitleInputChange}
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
          onClick={props.handleClose}
          sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'rgba(148,163,184,0.08)' } }}
        >
          Cancel
        </Button>
        <Button
          onClick={props.handleCreateIssue}
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
            '&:hover': { background: 'linear-gradient(135deg, #818cf8, #6366f1)' },
          }}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateIssue;
