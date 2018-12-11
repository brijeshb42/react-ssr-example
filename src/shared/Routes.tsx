import * as React from 'react';
import { default as Loadable } from 'react-loadable';
import { Route, Switch } from 'react-router-dom';

import './styles/base.css';

import App from './App';

/* tslint:disable-next-line:variable-name */
const Test = Loadable({
  delay: 300,
  loader: () => import('./Test'),
  loading: () => <div>Loading</div>,
});

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
