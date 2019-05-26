import React, { Component } from 'react';
import {
  getRoomIssues,
  getRoomParticipants,
  createIssue,
  getRoomCurrentIssue,
  setRoomCurrentIssue
} from '../services/api';
import toastr from 'toastr';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Person from '@material-ui/icons/Person';
import CheckCircleOutline from '@material-ui/icons/CheckCircleOutline';
import RadioButtonUnchecked from '@material-ui/icons/RadioButtonUnchecked';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import CreateIssueComponent from './CreateIssue';
import Board from './Board';

const drawerWidth = 240;
const BaseRoomWsUrl = `ws://127.0.0.1:8000/ws/rooms/`

const styles = theme => ({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  test: {
    textAlign: "center",
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing.unit * 3,
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing.unit * 2,
    right: theme.spacing.unit * 2,
  },
  extendedIcon: {
    marginRight: theme.spacing.unit,
  },
  toolbar: theme.mixins.toolbar,
});

export class Room extends Component {
  roomUid = undefined;
  ws = undefined;
  classes = this.props.classes;

  state = {
    issues: [],
    participants: [],
    open: false,
    issueTitle: undefined,
    currentIssue: undefined
  }

  handleClickOpen = () => {
    this.setState(Object.assign(
      {},
      this.state,
      { open: true }
    ));
  };

  handleClose = () => {
    this.setState(Object.assign(
      {},
      this.state,
      { open: false }
    ));
  };

  handleCreateIssue = () => {
    createIssue(this.roomUid, this.state.issueTitle)
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

  handleIssueTitleInputChange = (event) => {
    this.setState(Object.assign(
      {},
      this.state,
      { issueTitle: event.target.value }
    ));
  }

  issueItemOnClick = (issue) => {
    setRoomCurrentIssue(this.roomUid, issue.uid)
      .then(data => {
        if (data) {

        } else {
          toastr.error("Something went wrong!");
        }
      })
      .catch(error => console.log(error));
  }

  componentDidMount() {
    this.roomUid = this.props.match.params.roomUid;
    this.ws = new WebSocket(BaseRoomWsUrl + this.roomUid + '/')

    getRoomIssues(this.roomUid)
      .then(data => {
        if (data) {
          this.setState({
            ...this.state,
            ...{
              issues: data
            }
          });
        } else {
          toastr.error("Something went wrong!");
        }
      })
      .catch(error => console.log(error));

    getRoomCurrentIssue(this.roomUid)
      .then(data => {
        if (data) {
          this.setState(Object.assign(
            {},
            this.state,
            { currentIssue: data }
          ));
        } else {
          toastr.error("Something went wrong!");
        }
      })
      .catch(error => console.log(error));

    getRoomParticipants(this.roomUid)
      .then(data => {
        if (data) {
          this.setState({
            ...this.state,
            ...{
              participants: data
            }
          });
        } else {
          toastr.error("Something went wrong!");
        }
      })
      .catch(error => console.log(error));

    this.ws.onopen = () => {
      // on connecting, do nothing but log it to the console
      console.log('connected')
    }

    this.ws.onmessage = evt => {
      // on receiving a message, add it to the list of messages
      const message = JSON.parse(evt.data);
      switch (message.type) {

        case "add_issue":
          this.setState(Object.assign(
            {},
            this.state,
            { issues: [message.content, ...this.state.issues] }
          ));
          break;

        case "update_issue":
          this.setState(Object.assign(
            {},
            this.state,
            {
              issues: this.state.issues.map(issue => {
                return issue.uid !== message.content.uid ? issue : message.content
              })
            }
          ));
          break;

        case "add_participant":
          this.setState(Object.assign(
            {},
            this.state,
            { participants: [message.content, ...this.state.participants] }
          ));
          break;

        case "current_issue":
          this.setState(Object.assign(
            {},
            this.state,
            { currentIssue: message.content }
          ));
          break;

        case "add_vote":
          this.setState(Object.assign(
            {},
            this.state,
            {
              currentIssue: Object.assign(
                {},
                this.state.currentIssue,
                {
                  votes: [message.content, ...this.state.currentIssue.votes.filter(
                    v => v.participant.uid !== message.content.participant.uid
                  )]
                }
              )
            }
          ));
          break;

        default:
          break;
      }
    }

    this.ws.onclose = () => {
      console.log('disconnected')
      // automatically try to reconnect on connection loss
      this.setState({
        ws: new WebSocket(BaseRoomWsUrl + this.roomUid + '/'),
      })
    }
  }

  render() {
    return (
      <div className={this.classes.root}>

        <CssBaseline />
        <AppBar position="fixed" className={this.classes.appBar}>
          <Toolbar>
            <Typography variant="h6" color="inherit" noWrap className={this.classes.test}>
              Planning Poker - Room ID to invite other: {this.roomUid}
            </Typography>
          </Toolbar>
        </AppBar>

        <Drawer
          className={this.classes.drawer}
          variant="permanent"
          classes={{
            paper: this.classes.drawerPaper,
          }}
        >
          <div className={this.classes.toolbar} />
          <h3 style={{ textAlign: "center" }}>Participants</h3>
          <Divider />

          <List>
            {this.state.participants.map((participant, index) => (
              <ListItem button key={participant.uid}>
                <ListItemIcon><Person /></ListItemIcon>
                <ListItemText primary={participant.name} />
              </ListItem>
            ))}
          </List>

        </Drawer>

        <main className={this.classes.content}>
          <div className={this.classes.toolbar} />
          <Board
            currentIssue={this.state.currentIssue}
            roomUid={this.roomUid}
          />
        </main>

        <Drawer
          className={this.classes.drawer}
          variant="permanent"
          classes={{
            paper: this.classes.drawerPaper,
          }}
          anchor="right"
        >
          <div className={this.classes.toolbar} />
          <h3 style={{ textAlign: "center" }}>Issues</h3>
          <Divider />
          <List>
            {this.state.issues.map((issue, index) => (
              <ListItem button key={issue.uid}
                onClick={this.issueItemOnClick.bind(this, issue)} >
                <ListItemIcon>
                  {issue.is_current ? <CheckCircleOutline /> : <RadioButtonUnchecked />}
                </ListItemIcon>
                <ListItemText primary={issue.title} />
                <ListItemText
                  primary={issue.estimated_points ? issue.estimated_points : "N/A"}
                  style={{ textAlign: "right" }}
                />
              </ListItem>
            ))}
          </List>
          <Fab color="primary" aria-label="Add" className={this.classes.fab}
            onClick={this.handleClickOpen}>
            <AddIcon />
          </Fab>
          <CreateIssueComponent
            open={this.state.open}
            handleClose={this.handleClose}
            handleCreateIssue={this.handleCreateIssue}
            handleIssueTitleInputChange={this.handleIssueTitleInputChange}
          />
        </Drawer>

      </div>
    )
  }
}

Room.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Room);
