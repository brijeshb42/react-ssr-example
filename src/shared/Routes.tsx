import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import App from './App';
import Test from './Test';

/* tslint:disable-next-line:function-name */
function RouteCollection() {
  return (
    <Switch>
      <Route path="/test" component={Test} />
      <Route path="/" component={App} />
    </Switch>
  );
}

export default RouteCollection;
