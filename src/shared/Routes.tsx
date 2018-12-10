import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import { default as Loadable } from 'react-loadable';

import App from './App';

import './styles/base.css';

const test = Loadable({
  /* tslint:disable-next-line:space-in-parens */
  loader: () => import('./Test'/* webpackChunkName: "TestView" */),
  loading: () => <div>Loading</div>,
});

/* tslint:disable-next-line:function-name */
function RouteCollection() {
  return (
    <Switch>
      <Route path="/test" component={test} />
      <Route path="/" component={App} />
    </Switch>
  );
}

export default RouteCollection;
