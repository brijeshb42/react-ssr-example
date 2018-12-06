import * as React from 'react';
import { renderToNodeStream } from 'react-dom/server';

import { BaseApp } from './Base';
import { getHeader, getFooter } from './template';
import { Request, Response, NextFunction } from 'express';

const fePort = process.env.FE_PORT as string;
const isDev = process.env.NODE_ENV !== 'production';

function reactMiddleWare(req: Request, res: Response, next: NextFunction) {
  res.write(getHeader({
    isDev,
    fePort,
    title: 'Testing 1',
  }));

  if (!__ISOMORPHIC__) {
    // If not isomorphic, end the response here and let the
    // client code do its thing
    res.end(getFooter({
      fePort,
      scripts: ['client.js'],
      serverRendered: false,
    }));
  } else {
    const routerContext = {};
    const stream = renderToNodeStream(React.createElement(BaseApp, {
      routerContext,
      url: req.url,
    }));
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
  }
}

export default reactMiddleWare;

declare var __ISOMORPHIC__: boolean;
