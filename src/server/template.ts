import { html } from 'common-tags';

function createScriptTag(port: number | string, src: string) {
  return `<script src="//localhost:${port}/${src}"></script>`;
}

function createLinkTag(
  port: number | string,
  href: string,
  rel: string = 'stylesheet'
): string {
  return `<link rel="${rel}" href="//localhost:${port}/${href} />`;
}

interface IHeaderOpts {
  title: string;
  isDev: boolean;
  fePort: number | string;
}

export function getHeader(options: IHeaderOpts) {
  return html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="ie=edge" />
        <title>${options.title}</title>
        ${!options.isDev ? createLinkTag(options.fePort, 'client.css') : ''}
      </head>
      <body>
        <div id="app">
  `;
}

interface IFooterOpts {
  serverRendered?: boolean;
  scripts: string[];
  fePort: number | string;
}

export function getFooter(options: IFooterOpts) {
  return html`</div>
  <script>
  var MyApp = {
    serverRendered: ${options.serverRendered!.toString()},
  };
  </script>
  ${options.scripts.map(src => createScriptTag(options.fePort, src))}
</body>
</html>`;
}
