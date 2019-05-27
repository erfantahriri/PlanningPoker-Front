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
	classes = this.props.classes;

	render() {
		return (
			<Card className={this.classes.card} style={{
				margin: "7px",
				display: "inline-block",
				width: "50 px",
				height: "50 px",
			}}>
				<CardContent>
					<Typography variant="h4" component="h2">
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
