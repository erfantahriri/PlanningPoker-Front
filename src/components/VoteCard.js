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

export class VoteCard extends Component {
	render() {
		return (
			<Card className={this.props.classes.card} style={{
				margin: "7px",
				display: "inline-block",
				width: "50 px",
				height: "50 px",
			}}>
				<CardContent>
					<Typography variant="h7" component="h7" style={{
						textAlign: "center"
					}}>
						{this.props.vote.participant.name}
					</Typography>
					<Typography variant="h4" component="h2" style={{
						textAlign: "center",
						marginTop: "10px"
					}}>
						{this.props.vote_cards_status === "visible" ?
							this.props.vote.estimated_points : "***"}
					</Typography>
				</CardContent>
			</Card>
		);
	}
}

VoteCard.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(VoteCard);
