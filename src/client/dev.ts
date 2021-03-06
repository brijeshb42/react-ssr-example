import debug from 'debug';

const notifNode = document.createElement('div');
const titleNode = document.createElement('h4');
const descNode = document.createElement('div');
notifNode.appendChild(titleNode);
notifNode.appendChild(descNode);

titleNode.setAttribute('style', 'margin: 5px 0px;');
notifNode.setAttribute(
  'style',
  `position: fixed;
  bottom: 10px;
  right: 10px;
  width: 30%;
  border: 1px solid 1px;
  padding: 5px 10px;
  background: teal`
);
let notifTimeout: NodeJS.Timeout;

function showNotif(text: string, desc: string = '') {
  clearTimeout(notifTimeout);
  titleNode.textContent = text;
  descNode.innerHTML = desc;

  document.body.appendChild(notifNode);
  notifTimeout = setTimeout(() => {
    document.body.removeChild(notifNode);
  }, 5000);
}

const log = debug('dev:client');

const eventSource = new EventSource('/devstream');
eventSource.addEventListener('message', ev => {
  try {
    const data: { type: string; data: string[] } = JSON.parse(
      (ev as MessageEvent).data
    );
    log(`Message from stream - ${data.type}`);

    if (data.type === 'error') {
      showNotif('Server error', 'See console for details');
      log(data.data.join('\n'));
    }
  } catch (ex) {
    log(ex);
  }
});
