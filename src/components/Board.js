import React, { Component } from 'react';
import toastr from 'toastr';
import StoryPointCard from './Card';
import VoteCard from './VoteCard';
import { submitRoomIssueVote, updateIssue } from '../services/api';
import ButtonBase from '@material-ui/core/ButtonBase';
import Button from '@material-ui/core/Button';
import UpdateIssueComponent from './UpdateIssue';

export class Board extends Component {
	storyPoints = ["0", "1/2", "1", "2", "3", "5", "8", "13", "20", "40", "100", "?"];

	state = {
		updateIssueDialogOpen: false,
		currentIssueEstimatedPoints: undefined
	}

	storyPointCardOnClick = (event) => {
		submitRoomIssueVote(
			this.props.roomUid,
			this.props.currentIssue.uid,
			event.target.innerText
		)
			.catch(error => {
				console.log(error);
				toastr.error("Something went wrong!");
			});
	}

	handleClickOpenUpdateIssueDialog = () => {
		this.setState(Object.assign(
			{},
			this.state,
			{ updateIssueDialogOpen: true }
		));
	};

	handleUpdateIssueDialogClose = () => {
		this.setState(Object.assign(
			{},
			this.state,
			{ updateIssueDialogOpen: false }
		));
	};

	handleUpdateIssue = () => {
		updateIssue(
			this.props.roomUid,
			this.props.currentIssue.uid,
			this.props.currentIssue.title,
			this.state.currentIssueEstimatedPoints,
		)
			.then(data => {
				if (data) {
					this.setState(Object.assign(
						{},
						this.state,
						{ open: false }
					));
				} else {
					toastr.error("Something went wrong!");
				}
			})
			.catch(error => console.log(error));
	};

	handleEstimatedPointsChange = (event) => {
		this.setState(Object.assign(
			{},
			this.state,
			{ currentIssueEstimatedPoints: event.target.value }
		));
	}

	render() {
		return (
			<div>
				<div>
					{this.props.currentIssue ? this.props.currentIssue.title : ""}
					<Button
						variant="contained"
						color="primary"
						style={{ float: "right" }}
						onClick={this.handleClickOpenUpdateIssueDialog}
					>
						Update Issue
          </Button>
					<UpdateIssueComponent
						updateIssueDialogOpen={this.state.updateIssueDialogOpen}
						handleUpdateIssueDialogClose={this.handleUpdateIssueDialogClose}
						handleUpdateIssue={this.handleUpdateIssue}
						handleEstimatedPointsChange={this.handleEstimatedPointsChange}
					/>
					<div>
						{this.props.currentIssue
							&& this.props.currentIssue.votes.map(vote => <VoteCard vote={vote} />)}
					</div>
				</div>
				<div style={{
					position: "absolute",
					bottom: "20px",
					marginRight: "250px",
				}}>
					{this.storyPoints.map(storyPoint =>
						(<ButtonBase onClick={this.storyPointCardOnClick}>
							<StoryPointCard storyPoint={storyPoint} />
						</ButtonBase>))}
				</div>
			</div>
		)
	}
}

export default Board
