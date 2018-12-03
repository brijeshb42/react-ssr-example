import * as React from 'react';
import { Link } from 'react-router-dom';

/* tslint:disable-next-line:function-name */
function Home() {
  return <p>Home <Link to="/test">Test</Link></p>;
}

export default Home;
