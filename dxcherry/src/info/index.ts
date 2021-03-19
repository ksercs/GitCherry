import { window } from 'vscode';
import log from './log';

function logInfo (msg: string) {
  log.appendLine(msg);
};

function showInfo (msg: string) {
  window.showInformationMessage(msg);
};

export {
  showInfo,
  logInfo
};
