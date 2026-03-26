import React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

export default class CreateIssue extends React.Component {
	render() {
		return (
			<div>
				<Dialog
					open={this.props.createIssueDialogOpen}
					aria-labelledby="form-dialog-title"
				>
					<DialogTitle id="form-dialog-title">Create Issue</DialogTitle>
					<DialogContent>
						<TextField
							autoFocus
							margin="dense"
							id="issueTitle"
							label="Issue Title"
							type="text"
							fullWidth
							onChange={this.props.handleIssueTitleInputChange}
						/>
					</DialogContent>
					<DialogActions>
						<Button onClick={this.props.handleClose} color="primary">
							Cancel
            </Button>
						<Button onClick={this.props.handleCreateIssue} color="primary">
							Create
            </Button>
					</DialogActions>
				</Dialog>
			</div>
		);
	}
}