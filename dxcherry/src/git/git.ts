import simpleGit, { SimpleGit } from 'simple-git';
import { workspace, window } from 'vscode';

export default class Git {
    private static git: SimpleGit;

    static async init () {
      const options = {
        baseDir: workspace.workspaceFolders?.[0].uri.fsPath,
        binary: 'git',
        maxConcurrentProcesses: 6
      };

      Git.git = simpleGit(options);
      await Git.git.init();
      Git.getRepoData();
    }

    static async getLastCommit () {
      try {
        const commits = await Git.git.log(['-1']);
        return commits.all[0];
      } catch (err) {
        window.showErrorMessage('Cannot get last commit. Please, check that opened workspace folder is git repository');
      }
    }

    static async getRepoData () {
      let remoteUrl;
      try {
        remoteUrl = await Git.git.remote(['get-url', '--all', 'upstream']);
      } catch (err) {
        remoteUrl = await Git.git.remote(['get-url', '--all', 'origin']);
      }

      if (typeof remoteUrl !== 'string') {
        throw new Error('Repository is not found. Please, check that you opened folder which contains .git folder.');
      }

      const repoData = Git.parseURL(remoteUrl);
      if (repoData && repoData[1] && repoData[2]) {
        return {
          owner: repoData[1],
          repo: repoData[2]
        };
      }

      throw new Error('Repository is not found. Please, check that you opened folder which contains .git folder.');
    }

    private static parseURL (url: string) {
      let repoData = url.match('https://github.com/([A-Za-z0-9-]*)/([A-Za-z0-9-]*)');
      if (repoData?.[1] && repoData?.[2]) {
        return repoData;
      } else {
        repoData = url.match('git@github.com:([A-Za-z0-9-]*)/([A-Za-z0-9-]*).git');
        if (repoData?.[1] && repoData?.[2]) {
          return repoData;
        }
      }
    }
}
