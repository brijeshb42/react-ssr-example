import express from 'express';
import * as React from 'react';
import { renderToNodeStream } from 'react-dom/server';

import { BaseApp } from './Base';
import { getHeader, getFooter } from './template';

const fePort = process.env.FE_PORT as string;
const app = express();
const isDev = process.env.NODE_ENV !== 'production';

app.get('*', (req, res) => {
  res.write(getHeader({
    isDev,
    fePort,
    title: 'Testing',
  }));

  if (!__ISOMORPHIC__) {
    // If not isomorphic, end the response here and let the
    // client code do its thing
    res.end(getFooter({
      fePort,
      scripts: ['client.js'],
      serverRendered: false,
    }));
    return;
  }

  const routerContext = {};
  const stream = renderToNodeStream(React.createElement(BaseApp, {
    routerContext,
    url: req.url,
  }));
  // res.write(stream);
  stream.pipe(res, {
    end: false,
  });

  stream.on('end', () => {
    res.end(
      getFooter({
        fePort,
        scripts: ['client.js'],
        serverRendered: true,
      }),
    );
  });
});

export default app;

declare var __ISOMORPHIC__: boolean;
