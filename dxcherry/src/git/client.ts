import simpleGit, { SimpleGit } from 'simple-git';
import { workspace } from 'vscode';
import { repoNotFoundError, noLastCommitError } from '../info/errors/errors';
import { GITHUB_HTTPS_URL_REGEX, GITHUB_SSH_URL_REGEX } from './constants';
import { RepoDataType } from '../github/types';

export default class Git {
    private static git: SimpleGit;
    private static repoData: RepoDataType;

    private static parseURL (url: string) {
      let repoData = url.match(GITHUB_HTTPS_URL_REGEX);
      if (repoData?.[1] && repoData?.[2]) {
        return repoData;
      }

      repoData = url.match(GITHUB_SSH_URL_REGEX);
      if (repoData?.[1] && repoData?.[2]) {
        return repoData;
      }

      throw repoNotFoundError;
    }

    private static async getRemoteUrl () {
      let remoteUrl: string;
      try {
        remoteUrl = await Git.git.remote(['get-url', '--all', 'upstream']) as string;
      } catch (err) {
        remoteUrl = await Git.git.remote(['get-url', '--all', 'origin']) as string;
      }

      if (typeof remoteUrl !== 'string') {
        throw repoNotFoundError;
      }

      return remoteUrl;
    }

    private static async updateRepoData () {
      const remoteUrl = await Git.getRemoteUrl();
      const repoData = Git.parseURL(remoteUrl);
      Git.repoData = {
        owner: repoData[1],
        repo: repoData[2]
      };
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

    static async getLastCommit () {
      try {
        const commits = await Git.git.log(['-1']);
        return commits.all[0];
      } catch (err) {
        noLastCommitError.show();
      }
    }

    static getRepoData (): RepoDataType {
      return Git.repoData;
    }

    static async getBranchName (): Promise<string> {
      return (await Git.git.branch()).current;
    }
}
