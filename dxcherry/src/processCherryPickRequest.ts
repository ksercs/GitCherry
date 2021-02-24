import GithubClient from './github/client';
import Git from './git/git';
import { logInfo } from './info';
import { createPullRequest } from './github/createPullRequest';
import { Payload } from './payload';

async function processCherryPickRequest ({ title, description, versions, reviewers, labels }: Payload) {
  logInfo(`Prepare data: ${JSON.stringify(arguments)}`);
  const { login } = await GithubClient.getUser();
  const branch = await Git.getBranchName();
  // TODO: fix regexp and add error
  const branchWithoutVersion = branch.match('(.*)_[0-9]*_[0-9]*')?.[1] || '';

  logInfo(`login: ${login}, branch: ${branch}, branchWithoutVersion: ${branchWithoutVersion}`);

  versions.forEach(async (version: string) => {
      // cherry pick here

      // TODO: add 'cherry-pick' label to old versions
      await createPullRequest(login, branchWithoutVersion, version, title, description, labels, reviewers);
  });
};

export {
  processCherryPickRequest
};
