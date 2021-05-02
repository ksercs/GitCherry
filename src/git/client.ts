import simpleGit, { SimpleGit } from 'simple-git';
import { workspace, commands } from 'vscode';
import Logger from '../info/logger';
import { GITHUB_HTTPS_URL_REGEX, GITHUB_SSH_URL_REGEX, BRANCH_REGEX } from './constants';
import { RepoDataType } from '../github/types';

export default class Git {
    private static git: SimpleGit;
    private static repoData: RepoDataType;
    private static remote: string;
    private static localBranch: string;
    private static upstreamBranch: string;
    private static cherryState: {
      upstreams: string[],
      firstCommit: string,
      lastCommit: string
    } = {
      upstreams: [],
      firstCommit: '',
      lastCommit: ''
    };

    public static async init () {
      const options = {
        baseDir: workspace.workspaceFolders?.[0].uri.fsPath,
        binary: 'git',
        maxConcurrentProcesses: 6
      };

      Git.git = simpleGit(options);
      await Git.git.init();
      await Git.updateRepoData();
    }

    public static isRemoteUpstream () {
      return Git.remote === 'upstream';
    }

    public static setBranches (localBranch: string, upstreamBranch: string) {
      Git.localBranch = localBranch;
      Git.upstreamBranch = upstreamBranch;
    }

    public static async startCherryPicking (upstreams: string[]) {
      Git.cherryState.upstreams = upstreams;
      const [firstCommitHash, lastCommitHash] = await Git.pickCommitsHash();
      Git.cherryState.firstCommit = firstCommitHash;
      Git.cherryState.lastCommit = lastCommitHash;
      Logger.logInfo(`cherryState set: ${JSON.stringify(Git.cherryState)}`);

      await Git.cherryPickToNextUpstream();
    }

    public static async abortCherryPicking () {
      const currentBranch = await Git.getBranchName();
      Logger.showInfo(`Cherry picking to ${currentBranch} is aborted.`);
      await Git.git.raw(['cherry-pick', '--abort']);
      await Git.isMergeConflict(false);
      await Git.cherryPickToNextUpstream();
    }

    public static async getFirstCommit () {
      try {
        const currentBranch = await Git.getBranchName();
        const remoteBranch = `${Git.remote}/${Git.parseBranch(currentBranch)[1]}`;
        const commits = await Git.git.log({ from: remoteBranch, to: currentBranch });
        return commits.all[commits.all.length - 1];
      } catch (e) {
        if (e.message === 'Incorrect branch name') {
          throw new Error(e.message);
        } else {
          Logger.showNoFirstCommitError();
        }
      }
    }

    public static getRepoData (): RepoDataType {
      return Git.repoData;
    }

    public static async getBranchName (): Promise<string> {
      return (await Git.git.branch()).current;
    }

    public static parseBranch (branch: string): [string, string] {
      if (!BRANCH_REGEX.test(branch)) {
        Logger.showIncorrectBranchNameError(branch);
        throw new Error('Incorrect branch name');
      }

      const parsedBranchName = branch.match(BRANCH_REGEX) as RegExpMatchArray;
      return [parsedBranchName[1], parsedBranchName[2]];
    };

    public static async push () {
      const currentBranch = await Git.getBranchName();
      Logger.showInfo(`Commits are pushed to the branch ${currentBranch}`);
      await Git.git.push('origin', currentBranch);
    }

    public static async checkOut (localBranch: string, upstreamBranch: string) {
      const toBranch = `${localBranch}__${upstreamBranch}`;
      Logger.logInfo(`git checkout ${toBranch}`);
      await Git.git.checkout(`${toBranch}`);
      Logger.logInfo(`now at branch: ${await Git.getBranchName()}`);
    }

    public static async continueCherryPick () {
      Logger.logInfo('continue cherry-pick');
      try {
        Logger.logInfo('git cherry-pick --continue');
        await Git.git.raw(['cherry-pick', '--continue']);
        Logger.logInfo('merge conflict is solved');
        await Git.isMergeConflict(false);
        Git.cherryPickToNextUpstream();
      } catch (e) {
        Logger.logError(e);
        const message = e.message;
        const isMergeConflictSolveNotCommited = message.includes('Terminal is dumb');
        const isConflictNotSolved = message.includes('unmerged files') || message.includes('not staged');
        const isNoCherryPickInProgress = message.includes('no cherry-pick');
        if (isMergeConflictSolveNotCommited) {
          Logger.showNotCommitedMergeConflictSolvingWarning();
          return;
        }
        if (isConflictNotSolved) {
          Logger.showNotSolvedMergeConflictWarning();
          return;
        }
        if (!isNoCherryPickInProgress) {
          await Git.solveCherryPickProblem(!e.message.includes('CONFLICT'));
        } else {
          Logger.logInfo('merge conflict is solved');
          await Git.isMergeConflict(false);
          Git.cherryPickToNextUpstream();
        }
      }
    }

    public static async checkoutBack () {
      Logger.logInfo(`checkout back to ${Git.localBranch}__${Git.upstreamBranch}`);
      await Git.checkOut(Git.localBranch, Git.upstreamBranch);
    }

    // private

    private static async isMergeConflict (isMergeConflict: boolean) {
      if (isMergeConflict) {
        Logger.logInfo('merge conflict is detected');
        Logger.logInfo('show continue button');
        Logger.showMergeConflictDetectedWarning(await Git.getBranchName());
      } else {
        Logger.logInfo('hide continue button');
      }
      commands.executeCommand('setContext', 'isMergeConflict', isMergeConflict);
    }

    private static async cherryPickToNextUpstream () {
      const upstreamsCount = Git.cherryState.upstreams.length;
      const startBranchName = `${Git.localBranch}__${Git.upstreamBranch}`;
      const currentBranch = await Git.getBranchName();

      if (currentBranch !== startBranchName) {
        Logger.showInfo(`Cherry picked successfully to branch "${currentBranch}".`);
      }

      if (upstreamsCount === 0) {
        if (currentBranch !== startBranchName) {
          Git.checkoutBack();
        }
        return;
      }

      const upstreamBranch = Git.cherryState.upstreams[upstreamsCount - 1];
      Git.cherryState.upstreams.length = upstreamsCount - 1;

      Logger.logInfo(`start cherry-picking to ${upstreamBranch}`);
      try {
        await Git.branchOut(Git.localBranch, upstreamBranch);
        await Git.cherryPick(Git.cherryState.firstCommit, Git.cherryState.lastCommit);
      } catch (e) {
        Logger.showError(e);
      }
    }

    private static async pickCommitsHash (): Promise<[string, string]> {
      const firstCommit = await Git.getFirstCommit();
      const lastCommit = await Git.getLastCommit();
      Logger.logInfo(`commits are picked: firstCommit=${firstCommit}, lastCommit=${lastCommit}`);
      return [firstCommit?.hash as string, lastCommit?.hash as string];
    };

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

    private static async getLastCommit () {
      try {
        const currentBranch = await Git.getBranchName();
        const remoteBranch = `${Git.remote}/${Git.parseBranch(currentBranch)[1]}`;
        const commits = await Git.git.log({ from: remoteBranch, to: currentBranch });
        return commits.all[0];
      } catch (err) {
        Logger.logError('no last commit');
      }
    }

    private static async fetch (upstreamBranch: string) {
      Logger.logInfo(`git fetch ${Git.remote} ${upstreamBranch}`);
      await Git.git.fetch(Git.remote, upstreamBranch);
    }

    private static async branchOut (localBranch: string, upstreamBranch: string) {
      const toBranch = `${localBranch}__${upstreamBranch}`;
      try {
        await Git.git.checkout(toBranch);
        Logger.logInfo(`git checkout ${toBranch}`);
        Logger.logInfo(`now at branch: ${await Git.getBranchName()}`);
        return;
      } catch (e) {
        Logger.logInfo(`no local branch ${toBranch}`);
      }

      await Git.fetch(upstreamBranch);
      Logger.logInfo(`git checkout ${Git.remote}/${upstreamBranch}`);
      await Git.git.checkout(`${Git.remote}/${upstreamBranch}`);
      Logger.logInfo(`git checkout -b ${toBranch}`);
      await Git.git.checkout(['-b', `${toBranch}`]);
      Logger.logInfo(`now at branch: ${await Git.getBranchName()}`);
    }

    private static async cherryPick (firstCommit: string, lastCommit: string) {
      try {
        if (firstCommit === lastCommit) {
          Logger.logInfo(`git cherry-pick ${firstCommit}`);
          await Git.git.raw(['cherry-pick', firstCommit]);
        } else {
          Logger.logInfo(`git cherry-pick ${firstCommit}^..${lastCommit}`);
          await Git.git.raw(['cherry-pick', `${firstCommit}^..${lastCommit}`]);
        }
        Git.cherryPickToNextUpstream();
      } catch (e) {
        Logger.logError(e);
        await Git.solveCherryPickProblem(!e.message.includes('CONFLICT'));
      }
    }

    private static async solveCherryPickProblem (shouldSkip: boolean) {
      if (shouldSkip) {
        Logger.logInfo('skip commit');
        try {
          await Git.git.raw(['cherry-pick', '--skip']);
          Git.cherryPickToNextUpstream();
        } catch (e) {
          Logger.logError(e);
          await Git.solveCherryPickProblem(!e.message.includes('CONFLICT'));
        }
      } else {
        Logger.logInfo('show "continue" button');
        Logger.logInfo('wait for merge conflict solve');
        await Git.isMergeConflict(true);
      }
    }
}
