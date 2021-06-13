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
      lastCommit: string,
      isAborted: boolean,
      currentBranchToCherryPick: string,
      isChangesStashed: boolean
    } = {
      upstreams: [],
      firstCommit: '',
      lastCommit: '',
      isAborted: false,
      currentBranchToCherryPick: '',
      isChangesStashed: false
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
      if (currentBranch !== Git.cherryState.currentBranchToCherryPick) {
        await Git.isMergeConflict(false);
        const additionalNote = Git.cherryState.isChangesStashed ? 'NOTE: not staged changes were stashed before cherry pick. Please, run "git stash apply" manually.' : '';
        Logger.showManualBranchChangeDetectedWarning([
          Git.cherryState.currentBranchToCherryPick,
          ...Git.cherryState.upstreams.map(b => `${Git.localBranch}__${b}`)
        ], additionalNote);
        Git.cherryState.isChangesStashed = false;
        return;
      }

      await Git.git.raw(['cherry-pick', '--abort']);
      await Git.isMergeConflict(false);
      Git.cherryState.isAborted = true;
      Logger.showInfo(`Cherry picking to ${Git.cherryState.currentBranchToCherryPick} is aborted.`);
      await Git.cherryPickToNextUpstream();
    }

    public static async getFirstCommit () {
      try {
        const currentBranch = await Git.getBranchName();
        const remoteBranch = `${Git.remote}/${Git.upstreamBranch}`;
        const commits = await Git.git.log({ from: remoteBranch, to: currentBranch });
        return commits.all[commits.all.length - 1];
      } catch (e) {
        if (e.message === 'Incorrect branch name') {
          throw new Error(e.message);
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

      const matches = branch.match(BRANCH_REGEX) as RegExpMatchArray;
      const localBranch = matches[1];
      const upstreamBranch = matches[2];
      if (branch.split('__').length > 2) {
        Logger.showSeveralSeparatorsWarning(localBranch, upstreamBranch);
      }
      return [localBranch, upstreamBranch];
    };

    public static async push () {
      const currentBranch = await Git.getBranchName();
      Logger.showInfo(`Commits are pushed to the branch ${currentBranch}`);
      await Git.git.push('origin', currentBranch);
    }

    public static async checkOut (toBranch: string, { createNew }: {createNew: boolean} = { createNew: false }) {
      try {
        if (createNew) {
          Logger.logInfo(`git checkout -b ${toBranch}`);
          await Git.git.checkout(['-b', toBranch]);
        } else {
          Logger.logInfo(`git checkout ${toBranch}`);
          await Git.git.checkout(toBranch);
        }
      } catch (e) {
        if (e.message.includes('stash')) {
          Logger.logError(e.message);
          await Git.stash();
          await Git.checkOut(toBranch, { createNew });
        } else {
          throw e;
        }
      }
      Logger.logInfo(`now at branch: ${await Git.getBranchName()}`);
    }

    public static async continueCherryPick () {
      const currentBranch = await Git.getBranchName();
      if (currentBranch !== Git.cherryState.currentBranchToCherryPick) {
        await Git.abortCherryPicking();
        return;
      }

      Logger.logInfo('continue cherry-pick');
      try {
        Logger.logInfo('git cherry-pick --continue');
        await Git.git.raw(['cherry-pick', '--continue']);
        Logger.logInfo('merge conflict is solved');
        await Git.isMergeConflict(false);
        await Git.cherryPickToNextUpstream();
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
          await Git.cherryPickToNextUpstream();
        }
      }
    }

    public static async checkoutBack () {
      const toBranch = `${Git.localBranch}__${Git.upstreamBranch}`;
      Logger.logInfo(`checkout back to ${toBranch}`);
      await Git.checkOut(toBranch);
      if (Git.cherryState.isChangesStashed) {
        await Git.stash({ apply: true });
      }
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

      if (currentBranch !== startBranchName && !Git.cherryState.isAborted) {
        Logger.showInfo(`Cherry picked successfully to branch "${Git.cherryState.currentBranchToCherryPick}".`);
      }
      Git.cherryState.isAborted = false;

      if (upstreamsCount === 0) {
        if (currentBranch !== startBranchName) {
          await Git.checkoutBack();
        }
        return;
      }

      const upstreamBranch = Git.cherryState.upstreams[upstreamsCount - 1];
      Git.cherryState.upstreams.length = upstreamsCount - 1;

      Logger.logInfo(`start cherry-picking to ${upstreamBranch}`);
      try {
        Git.cherryState.currentBranchToCherryPick = `${Git.localBranch}__${upstreamBranch}`;
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
        const remoteBranch = `${Git.remote}/${Git.upstreamBranch}`;
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
      const fromFullUpstreamBranch = `${Git.remote}/${upstreamBranch}`;
      try {
        await Git.checkOut(toBranch);
        return;
      } catch (e) {
        Logger.logInfo(`no local branch ${toBranch}`);
      }

      await Git.fetch(upstreamBranch);

      await Git.checkOut(fromFullUpstreamBranch);
      await Git.checkOut(toBranch, { createNew: true });
    }

    private static async stash ({ apply }: {apply: boolean} = { apply: false }) {
      if (apply) {
        Logger.logInfo('git stash apply');
        await Git.git.stash(['apply']);
        Git.cherryState.isChangesStashed = false;
      } else {
        Logger.logInfo('git stash');
        await Git.git.stash();
        Git.cherryState.isChangesStashed = true;
      }
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
        await Git.cherryPickToNextUpstream();
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
          await Git.cherryPickToNextUpstream();
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
