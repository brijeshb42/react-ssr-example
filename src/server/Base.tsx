import * as React from 'react';
import { StaticRouter } from 'react-router-dom';

import Routes from '@shared/Routes';

interface Props {
  url: string;
  routerContext: Object;
}

/* tslint:disable-next-line:function-name */
export function BaseApp({ url, routerContext }: Props) {
  return (
    <StaticRouter location={url} context={routerContext}>
      <Routes />
    </StaticRouter>
  );
}
