import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

const styles = {
	card: {
		minWidth: 40,
	},
};

export class StoryPointCard extends Component {

	getStyle() {
		let cardStyle = {
			margin: "7px",
			display: "inline-block",
			width: "50 px",
			height: "50 px",
			marginBottom: "7px",
			transition: "0.3s"
		}
		if (this.props.isMyVote) {
			cardStyle.backgroundColor = "#e0e0e0";
			cardStyle.transform = "translateY(-10px)";
		}
		return cardStyle;
	}

	render() {
		return (
			<Card className={this.props.classes.card} style={this.getStyle()}>
				<CardContent>
					<Typography variant="h5" component="h2">
						{this.props.storyPoint}
					</Typography>
				</CardContent>
			</Card>
		);
	}
}

StoryPointCard.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(StoryPointCard);
