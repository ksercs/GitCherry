import { window } from 'vscode';
import log from './log';

const ERRORS = {
    pullRequestCreatingError: `Pull request from $ to $ was not created! $`,
    githubLoginNotFoundError: `User github login was not found in the database: $`,
    repoNotFoundError: 'Repository is not found. Check that a git repository is opened.',
    missingGithubTokenError: 'Missing Github token',
    missingOctokitClientError: 'Missing octokit client',
    msRefreshError: 'Something went wrong during refresh. Check you signed in MS corporate account',
    ownerSquadNotFoundError: 'Owner squad is not found',
    noLastCommitError: 'No last commit found.Check that a git repository is opened.'
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
}

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
    }
};

Object.entries(ERRORS).forEach(([name, templateMessage]) => {
    Logger[name] = (...args: string[]) => {
        const msg: string = prepareMessage(templateMessage, args);

        Logger.logError(msg);
        Logger.showError(msg);
    } 
});

export default Logger;