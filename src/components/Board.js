import React, { Component } from 'react';
import StoryPointCard from './Card'

export class Board extends Component {
	storyPoints = ["0", "1/2", "1", "2", "3", "5", "8", "13", "20", "40", "100", "?"];
	render() {
		return (
			<div>
				<div>
					{this.props.currentIssue ? this.props.currentIssue.title : ""}
				</div>
				<div style={{
					position: "absolute",
					bottom: "20px",
					marginRight: "250px",
				}}>
					{this.storyPoints.map(sp => <StoryPointCard sp={sp} />)}
				</div>
			</div>
		)
	}
}

export default Board
