import { window, env, Uri, MessageItem } from 'vscode';
import log from './log';

const ERRORS = {
  PullRequestCreatingError: 'Pull request from $ to $ was not created! $',
  GithubLoginNotFoundError: 'User github login was not found in the database: $',
  RepoNotFoundError: 'Repository is not found. Check that a git repository is opened.',
  MissingGithubTokenError: 'Missing Github token.',
  MsRefreshError: 'Something went wrong during refresh. Check you signed in MS corporate account.',
  OwnerSquadNotFoundError: 'Owner squad is not found.',
  NoLastCommitError: 'No last commit found. Check that a git repository is opened.',
  IncorrectBranchNameError: '"$" is not correct branch name. Name your branch as *name_XX_X* (eg "branch_20_1")'
};

const prepareMessage = (msg: string, args: string[]) => {
  let res: string = '';
  let argIndex: number = 0;

  for (let i = 0; i < msg.length; ++i) {
    const c = msg[i];

    if (c === '$') {
      res += args[argIndex++];
    } else {
      res += c;
    }
  }

  return res;
};

const Logger: any = {
  showError: (msg: string) => {
    window.showErrorMessage(msg);
  },

  showInfo: (msg: string) => {
    window.showInformationMessage(msg);
  },

  logError: (msg: string) => {
    log.appendLine(`ERROR: ${msg}`);
  },

  logInfo: (msg: string) => {
    log.appendLine(`INFO: ${msg}`);
  },

  showPullRequestCreatingMessage: (msg: string, url: string) => {
    window.showInformationMessage(msg, 'Open').then(() => {
      env.openExternal(Uri.parse(url));
    });
  }
};

Object.entries(ERRORS).forEach(([name, templateMessage]) => {
  Logger[`show${name}`] = (...args: string[]) => {
    const msg: string = prepareMessage(templateMessage, args);

    Logger.logError(msg);
    Logger.showError(msg);
  };
});

export default Logger;
