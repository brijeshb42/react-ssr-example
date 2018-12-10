import * as React from 'react';
import { Link } from 'react-router-dom';

export default class App extends React.Component {
  render() {
    return (
      <div className="app">
        <p>Hello World <Link to="/test">Test</Link></p>
      </div>
    );
  }
}
