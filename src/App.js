import React, { Component } from 'react';
import { Route, BrowserRouter } from 'react-router-dom';
import Main from './components/Main';
import Room from './components/Room';

export class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Route exact path="/" component={Main} />
        <Route path="/rooms/:roomUid" component={Room} />
      </BrowserRouter>
    )
  }
}

export default App
