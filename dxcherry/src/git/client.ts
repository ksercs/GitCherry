import simpleGit, { SimpleGit } from 'simple-git';
import { workspace } from 'vscode';
import Logger from '../info/logger';
import { GITHUB_HTTPS_URL_REGEX, GITHUB_SSH_URL_REGEX, BRANCH_REGEX } from './constants';
import { RepoDataType } from '../github/types';

export default class Git {
    private static git: SimpleGit;
    private static repoData: RepoDataType;
    private static remote: string;

    private static parseURL (url: string) {
      let repoData = url.match(GITHUB_HTTPS_URL_REGEX);
      if (repoData?.[1] && repoData?.[2]) {
        return repoData;
      }

      repoData = url.match(GITHUB_SSH_URL_REGEX);
      if (repoData?.[1] && repoData?.[2]) {
        return repoData;
      }

      Logger.showRepoNotFoundError();
    }

    private static async getRemoteUrl () {
      let remoteUrl: string = '';
      try {
        remoteUrl = await Git.git.remote(['get-url', '--all', 'upstream']) as string;
        Git.remote = 'upstream';
      } catch (err) {
        try {
          remoteUrl = await Git.git.remote(['get-url', '--all', 'origin']) as string;
          Git.remote = 'origin';
        } catch (e) {
          if (typeof remoteUrl !== 'string') {
            Logger.showRepoNotFoundError();
            return;
          }
        }
      }

      return remoteUrl;
    }

    private static async updateRepoData () {
      const remoteUrl = await Git.getRemoteUrl() as string;
      const repoData = Git.parseURL(remoteUrl);
      Git.repoData = {
        owner: repoData?.[1],
        repo: repoData?.[2]
      } as RepoDataType;
    }

    static async init () {
      const options = {
        baseDir: workspace.workspaceFolders?.[0].uri.fsPath,
        binary: 'git',
        maxConcurrentProcesses: 6
      };

      Git.git = simpleGit(options);
      await Git.git.init();
      await Git.updateRepoData();
    }

    static async getFirstCommit () {
      try {
        const currentBranch = await Git.getBranchName();
        const remoteBranch = `${Git.remote}/${Git.parseBranch(currentBranch)[1]}`; 
        const commits = await Git.git.log({ from: remoteBranch, to: currentBranch});
        return commits.all[commits.all.length - 1];
      } catch (err) {
        Logger.showNoLastCommitError();
      }
    }

    static getRepoData (): RepoDataType {
      return Git.repoData;
    }

    static async getBranchName (): Promise<string> {
      return (await Git.git.branch()).current;
    }

    static parseBranch(branch: string): [string, string] {    
      if (!BRANCH_REGEX.test(branch)) {
        Logger.showIncorrectBranchNameError(branch);
        throw Error('Incorrect branch name');
      }
    
      const parsedBranchName = branch.match(BRANCH_REGEX) as RegExpMatchArray;
      return [parsedBranchName[1], parsedBranchName[2]];
    };
}
