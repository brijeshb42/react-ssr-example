import * as React from 'react';
import * as ReactDOM from 'react-dom';

import Base from './Base';

const serverRendered = (window.MyApp && window.MyApp.serverRendered) || false;
const appNode = document.getElementById('app');
const renderFunc = serverRendered ? ReactDOM.hydrate : ReactDOM.render;
renderFunc(Base, appNode);

if (__HOT_RELOAD__) {
  if (module.hot) {
    module.hot.accept('./Base', () => {
      const base = require('./Base').default;
      ReactDOM.unmountComponentAtNode(appNode!);
      ReactDOM.render(base, appNode);
    });
  }
}

declare var __HOT_RELOAD__: boolean;
declare global {
  interface Window {
    MyApp: {
      serverRendered: boolean;
    };
  }
}
