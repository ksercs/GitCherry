import { Octokit } from '@octokit/rest';
import { window } from 'vscode';
import getSession from './getSession';
import log from '../log';

let client : Octokit;

export async function createClient () {
  const session = await getSession();

  if (!session) {
    window.showErrorMessage('Missing GitHub token');
    log.appendLine('Missing GitHub token');
  }

  window.showInformationMessage(`You are logged in GitHub as ${session.account.label}`);
  log.appendLine(`${session.accessToken} ${session.id} ${session.account.label}`);

  client = new Octokit({
    auth: session.accessToken
  });
}

export function getClient () : Octokit {
  if (!client) {
    window.showErrorMessage('Missing octokit client');
    log.appendLine('Missing octokit client');
  }

  return client;
}
