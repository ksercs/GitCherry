import GithubClient from './github/client';
import Git from './git/client';
import { createPullRequest } from './github/createPullRequest';
import { TreePayload } from './tree/payload';
import Logger from './info/logger';

async function processCherryPickRequest (payload: TreePayload) {
  Logger.logInfo(`Prepare data: ${JSON.stringify(arguments)}`);
  const { login } = await GithubClient.getUser();
  const branch = await Git.getBranchName();
  // TODO: fix regexp and add error
  const branchWithoutVersion = branch.match('(.*)_[0-9]*_[0-9]*')?.[1] || '';

  Logger.logInfo(`login: ${login}, branch: ${branch}, branchWithoutVersion: ${branchWithoutVersion}`);

  payload.versions.forEach(async (version: string) => {
    // cherry pick here

    // TODO: add 'cherry-pick' label to old versions
    await createPullRequest(payload, login, branchWithoutVersion, version);
  });
};

export {
  processCherryPickRequest
};
