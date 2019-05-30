import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import { createRoom } from '../services/api';
import toastr from 'toastr';


const styles = theme => ({
	main: {
		width: 'auto',
		display: 'block', // Fix IE 11 issue.
		marginLeft: theme.spacing.unit * 3,
		marginRight: theme.spacing.unit * 3,
		[theme.breakpoints.up(400 + theme.spacing.unit * 3 * 2)]: {
			width: 400,
			marginLeft: 'auto',
			marginRight: 'auto',
		},
	},
	paper: {
		marginTop: theme.spacing.unit * 8,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`,
	},
	avatar: {
		margin: theme.spacing.unit,
		backgroundColor: theme.palette.secondary.main,
	},
	form: {
		width: '100%', // Fix IE 11 issue.
		marginTop: theme.spacing.unit,
	},
	submit: {
		marginTop: theme.spacing.unit * 3,
	},
});


export class CreateRoom extends Component {

	state = {
		title: "",
		description: "",
		creator: ""
	}

	createRoomOnClick = (event) => {
		event.preventDefault();
		createRoom(
			this.state.title,
			this.state.description,
			this.state.creator
		)
			.then(data => {
				if (data) {
					localStorage.setItem("accessToken", data.creator.access_token);
					localStorage.setItem("userUid", data.creator.uid);
					this.props.history.push("/rooms/" + data.uid);
				} else {
					toastr.error("Something went wrong!");
				}
			})
			.catch(error => console.log(error));
	}

	handleInputChange = (event) => {
		this.setState({ [event.target.name]: event.target.value })
	}

	render() {
		return (
			<main className={this.props.classes.main} >
				<CssBaseline />
				<Paper className={this.props.classes.paper}>
					<Typography component="h1" variant="h5">
						Create A New Room
					</Typography>
					<form className={this.props.classes.form}>
						<FormControl margin="normal" required fullWidth>
							<InputLabel htmlFor="title">Room Title</InputLabel>
							<Input id="title" name="title"
								autoFocus value={this.state.title}
								onChange={this.handleInputChange} />
						</FormControl>
						<FormControl margin="normal" fullWidth>
							<InputLabel htmlFor="description">Room Description</InputLabel>
							<Input name="description" id="description"
								value={this.state.description}
								onChange={this.handleInputChange} />
						</FormControl>
						<FormControl margin="normal" required fullWidth>
							<InputLabel htmlFor="creator">Creator Name</InputLabel>
							<Input name="creator" id="creator"
								value={this.state.creator}
								onChange={this.handleInputChange} />
						</FormControl>
						<Button
							type="submit"
							fullWidth
							variant="contained"
							color="secondary"
							className={this.props.classes.submit}
							onClick={this.createRoomOnClick}
						>
							Create
						</Button>
					</form>
				</Paper>
			</main>
		);
	}
}

CreateRoom.propTypes = {
	classes: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(CreateRoom))