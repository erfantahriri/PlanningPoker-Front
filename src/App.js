import React, { Component } from 'react';
import { Route, BrowserRouter } from 'react-router-dom';
import Main from './components/Main';

export class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Route exact path="/" component={Main} />
      </BrowserRouter>
    )
  }
}

export default App
