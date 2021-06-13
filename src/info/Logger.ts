import { window, env, Uri } from 'vscode';
import log from './log';

const ERRORS = {
  PullRequestCreatingError: 'Pull request from $ to $ was not created! $',
  RepoNotFoundError: 'Repository is not found. Check that a git repository is opened.',
  MissingGithubTokenError: 'Missing Github token.',
  NoFirstCommitError: 'No first commit found. Check that a git repository is opened.',
  IncorrectBranchNameError: '"$" is not a correct branch name. Name your branch as *branch__upstream*',
  NoCommitInBranchError: 'There is no new commits in "$" branch.',
  NoLocalBranchError: 'Branch "$" does not exist. Did you forget to cherry-pick?',
  NotStagedChangesFoundError: 'Not staged changes are found. $'
};

const WARNINGS = {
  NoUpstreamBranchToCherryPickWarning: 'No upstream branch selected to cherry pick. Current branch is "$"',
  NotCommitedMergeConflictSolvingWarning: 'Merge conflicts solving is not commited.',
  NotSolvedMergeConflictWarning: 'Please, solve merge conflicts and commit the changes.',
  MergeConflictDetectedWarning: `Merge conflict on branch "$" is detected. 
Please, solve it, commit and press "Continue cherry-pick" button.`,
  SeveralSeparatorsWarning: 'Branch name includes several "__". Branch name: "$", upstream branch name: "$"',
  ManualBranchChangeDetectedWarning: 'You manually checked out the branch during cherry-picking. Cherry picking to branches $ is aborted.'
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
    Logger.logError(msg);
    window.showErrorMessage(msg);
  },

  showInfo: (msg: string) => {
    Logger.logInfo(msg);
    window.showInformationMessage(msg);
  },

  showWarning: (msg: string) => {
    Logger.logWarning(msg);
    window.showWarningMessage(msg);
  },

  logError: (msg: string) => {
    log.appendLine(`ERROR: ${msg}`);
  },

  logInfo: (msg: string) => {
    log.appendLine(`INFO: ${msg}`);
  },

  logWarning: (msg: string) => {
    log.appendLine(`WARNING: ${msg}`);
  },

  showPullRequestCreatingMessage: (msg: string, url: string) => {
    Logger.logInfo(`${msg}: ${url}`);
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

Object.entries(WARNINGS).forEach(([name, templateMessage]) => {
  Logger[`show${name}`] = (...args: string[]) => {
    const msg: string = prepareMessage(templateMessage, args);

    Logger.logWarning(msg);
    Logger.showWarning(msg);
  };
});

export default Logger;
