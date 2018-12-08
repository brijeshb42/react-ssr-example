import express from 'express';

import reactMiddleWare from './reactMiddleWare';

function noop() {}

const app = express();

type MiddleWares = {
  route: string,
  when: 'pre' | 'post',
  middleWare: (req: express.Request, res: express.Response, next: express.NextFunction) => void,
}[];

function mountMiddleWares(middlewares: MiddleWares) {
  middlewares.filter(m => m.when === 'pre').forEach(m => app.use(m.route, m.middleWare));
  app.use('*', reactMiddleWare);
  middlewares.filter(m => m.when === 'post').forEach(m => app.use(m.route, m.middleWare));
}

export function start(middlewares: MiddleWares) {
  mountMiddleWares(middlewares);
}

export default app;
