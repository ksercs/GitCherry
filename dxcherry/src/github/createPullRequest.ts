import GithubClient from './client';
import Logger from '../info/logger';
import { TreePayload } from '../tree/payload';

async function createPullRequest ({ title, description, labels, reviewers }: TreePayload, login: string, branchWithoutVersion: string, version: string) {
  Logger.logInfo(`Start PR creating: ${version}`);

  const head = `${login}:${branchWithoutVersion}_${version}`;
  const pullRequest = await GithubClient.createPullRequest(head, version, title, description);

  if (pullRequest?.status === 201) {
    const pullRequestNumber = pullRequest.data.number;

    await GithubClient.setLabels(pullRequestNumber, [...labels, version]);
    await GithubClient.addAssign(pullRequestNumber, [login]);
    await GithubClient.addReviewers(pullRequestNumber, reviewers);
    Logger.logInfo('PR is customized');
  }
};

export {
  createPullRequest
};
