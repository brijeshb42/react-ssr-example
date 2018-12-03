import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import Home from './Home';
import Test from './Test';

/* tslint:disable-next-line:function-name */
function RouteCollection() {
  return (
    <Switch>
      <Route path="/test" component={Test} />
      <Route path="/" component={Home} />
    </Switch>
  );
}

export default RouteCollection;
