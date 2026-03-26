import React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

export default class UpdateIssue extends React.Component {
	render() {
		return (
			<div>
				<Dialog
					open={this.props.updateIssueDialogOpen}
					aria-labelledby="form-dialog-title"
				>
					<DialogTitle id="form-dialog-title">Update Issue</DialogTitle>
					<DialogContent>
						<TextField
							autoFocus
							margin="dense"
							id="issueEstimatedPoints"
							label="Issue Estimated Points"
							type="text"
							fullWidth
							onChange={this.props.handleEstimatedPointsChange}
						/>
					</DialogContent>
					<DialogActions>
						<Button onClick={this.props.handleUpdateIssueDialogClose} color="primary">
							Cancel
            </Button>
						<Button onClick={this.props.handleUpdateIssue} color="primary">
							Update
            </Button>
					</DialogActions>
				</Dialog>
			</div>
		);
	}
}