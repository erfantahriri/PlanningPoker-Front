import React, { Component } from 'react';
import toastr from 'toastr';
import StoryPointCard from './Card';
import VoteCard from './VoteCard';
import { submitRoomIssueVote } from '../services/api';
import ButtonBase from '@material-ui/core/ButtonBase';
import Button from '@material-ui/core/Button';

export class Board extends Component {
	storyPoints = ["0", "1/2", "1", "2", "3", "5", "8", "13", "20", "40", "100", "?"];

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

	render() {
		return (
			<div>
				<div>
					{this.props.currentIssue ? this.props.currentIssue.title : ""}
						<Button
							variant="contained"
							color="primary"
							style={{ float: "right" }}
							// onClick={this.UpdateIssueOnClick}
						>
							Update Issue
          </Button>
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
