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
    }

    static async getLastCommit () {
      try {
        const commits = await Git.git.log(['-1']);
        return commits.all[0];
      } catch (err) {
        window.showErrorMessage('Cannot get last commit. Please, check that opened workspace folder is git repository');
      }
    }
}
