import GithubClient from './github/client';
import Git from './git/client';
import { createPullRequest } from './github/createPullRequest';
import { TreePayload } from './tree/payload';
import Logger from './info/logger';

async function pushAndPullRequestCurrentBranch(payload: TreePayload, login: string, branchWithoutVersion: string, base_version: string, version: string) {
  await Git.push();
  await createPullRequest(payload, login, branchWithoutVersion, base_version, version);
};

async function createNewBranch(version: string, branchWithoutVersion: string) {
  await Git.fetch(version);
  Logger.logInfo(`create new branch ${branchWithoutVersion}_${version}`);
  await Git.branchOut(version, branchWithoutVersion);
};

async function pickCommitsHash(): Promise<[string, string]> {
  const firstCommit = await Git.getFirstCommit();
  const lastCommit = await Git.getLastCommit();
  return [firstCommit?.hash as string, lastCommit?.hash as string];
};


async function processCherryPickRequest (payload: TreePayload) {
  Logger.logInfo(`Prepare data: ${JSON.stringify(arguments)}`);
  const { login } = await GithubClient.getUser();
  const branch = await Git.getBranchName();
  const [branchWithoutVersion, base_version] = Git.parseBranch(branch);
  const versions = payload.versions.filter((version) => version !== base_version );

  Logger.logInfo(`login: ${login}, branch: ${branch}, branchWithoutVersion: ${branchWithoutVersion}, base_version: ${base_version}`);

  if (payload.versions.includes(base_version)) {
    await pushAndPullRequestCurrentBranch(payload, login, branchWithoutVersion, base_version, base_version);
  }

  const [firstCommitHash, lastCommitHash] = await pickCommitsHash();
  try {
    for (let i = 0; i < versions.length; ++i) {
      const version = versions[i];

      await createNewBranch(version, branchWithoutVersion);
      await Git.cherryPick(firstCommitHash, lastCommitHash);
      await pushAndPullRequestCurrentBranch(payload, login, branchWithoutVersion, base_version, version);
    }
  } catch (e) {
    Logger.logError(e);
  } finally {
    Logger.logInfo(`checkout back to ${branchWithoutVersion}_${base_version}`);
    await Git.checkOut(base_version, branchWithoutVersion);
  }
};

export {
  processCherryPickRequest
};
