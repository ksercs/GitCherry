import GithubClient from './client';
import { logInfo } from '../info';
import { TreePayload } from '../tree/payload';

async function createPullRequest ({ title, description, labels, reviewers}: TreePayload, login: string, branchWithoutVersion: string, version: string) {
  logInfo(`Start PR creating: ${version}`);

  const pullRequest = await GithubClient.createPullRequest(login, branchWithoutVersion, version, title, description);

  if (pullRequest?.status === 201) {
    const pullRequestNumber = pullRequest.data.number;

    await GithubClient.setLabels(pullRequestNumber, [...labels, version]);
    await GithubClient.addAssign(pullRequestNumber, [login]);
    await GithubClient.addReviewers(pullRequestNumber, reviewers);
    logInfo('PR is customized');
  }
};

export {
  createPullRequest
};
