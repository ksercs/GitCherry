import GithubClient from './github/client';
import Git from './git/client';
import { createPullRequest } from './github/createPullRequest';
import { TreePayload } from './tree/payload';
import Logger from './info/logger';

async function processCherryPickRequest (payload: TreePayload) {
  Logger.logInfo(`Prepare data: ${JSON.stringify(arguments)}`);
  const { login } = await GithubClient.getUser();
  const branch = await Git.getBranchName();
  const [branchWithoutVersion, base_version] = Git.parseBranch(branch);

  Logger.logInfo(`login: ${login}, branch: ${branch}, branchWithoutVersion: ${branchWithoutVersion}, base_version: ${base_version}`);

  payload.versions.forEach(async (version: string) => {
    // cherry pick here

    await createPullRequest(payload, login, branchWithoutVersion, base_version, version);
  });
};

export {
  processCherryPickRequest
};
