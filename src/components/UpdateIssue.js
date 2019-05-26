import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

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
						{/* <DialogContentText>
							Create an issue.
            </DialogContentText> */}
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