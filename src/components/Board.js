import React, { Component } from 'react';
import toastr from 'toastr';
import StoryPointCard from './Card';
import VoteCard from './VoteCard';
import {
	submitRoomIssueVote,
	updateIssue,
	flipIssueVoteCards,
	removeIssueVotes
} from '../services/api';
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

	handleClickFlipCard = () => {
		flipIssueVoteCards(
			this.props.roomUid,
			this.props.currentIssue.uid,
		)
			.then(data => {
				if (!data) {
					toastr.error("Something went wrong!");
				}
			})
			.catch(error => console.log(error));
	};

	handleClickResetBoard = () => {
		removeIssueVotes(
			this.props.roomUid,
			this.props.currentIssue.uid,
		)
			.then(data => {
				if (!data) {
					toastr.error("Something went wrong!");
				}
			})
			.catch(error => console.log(error));
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
						{ updateIssueDialogOpen: false }
					));
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
					<div>
						<Button
							variant="contained"
							color="primary"
							style={{ float: "right" }}
							onClick={this.handleClickOpenUpdateIssueDialog}
						>
							Update Issue
          </Button>
						<Button
							variant="contained"
							color="secondary"
							onClick={this.handleClickFlipCard}
						>
							Flip Cards
          </Button>
						<Button
							variant="contained"
							color="default"
							style={{ marginLeft: "10px" }}
							onClick={this.handleClickResetBoard}
						>
							Reset Board
          </Button>
					</div>
					<div style={{
						margin: "30px 0 10px 0",
						fontSize: "20px",
						fontWeight: "bold",
						textDecoration: "underline"
					}}>
						{this.props.currentIssue ? this.props.currentIssue.title : ""}
					</div>
					<UpdateIssueComponent
						updateIssueDialogOpen={this.state.updateIssueDialogOpen}
						handleUpdateIssueDialogClose={this.handleUpdateIssueDialogClose}
						handleUpdateIssue={this.handleUpdateIssue}
						handleEstimatedPointsChange={this.handleEstimatedPointsChange}
					/>
					<div>
						{this.props.currentIssue && this.props.currentIssue.votes.map(
							vote => <VoteCard
								vote={vote}
								vote_cards_status={this.props.currentIssue.vote_cards_status}
							/>
						)}
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
