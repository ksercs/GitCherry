import { Octokit } from '@octokit/rest';
import getSession from './getSession';
import { showInfo, logInfo } from '../info';
import { missingGithubTokenError, missingOctokitClientError } from '../info/errors/errors';

let client : Octokit;

export async function createClient () {
  const session = await getSession();

  if (!session) {
    missingGithubTokenError.show();
    missingGithubTokenError.log();
  }

  showInfo(`You are logged in GitHub as ${session.account.label}`);
  logInfo(`Github login: ${session.account.label}`);

  client = new Octokit({
    auth: session.accessToken
  });
}

export function getClient () : Octokit {
  if (!client) {
    missingOctokitClientError.show();
    missingOctokitClientError.log();
  }

  return client;
}
