import GithubClient from './client';
import Logger from '../info/logger';
import { TreePayload } from '../tree/payload';

async function createPullRequest ({ title, description, labels, reviewers }: TreePayload, login: string, branchWithoutVersion: string, base_version: string, version: string) {
  Logger.logInfo(`Start PR creating: ${version}`);

  const head = `${login}:${branchWithoutVersion}_${version}`;
  const pullRequest = await GithubClient.createPullRequest(head, version, title, description);

  labels = customizeLabels(labels, version, base_version);

  if (pullRequest?.status === 201) {
    const pullRequestNumber = pullRequest.data.number;

    await GithubClient.setLabels(pullRequestNumber, labels);
    await GithubClient.addAssign(pullRequestNumber, [login]);
    await GithubClient.addReviewers(pullRequestNumber, reviewers);
    Logger.logInfo('PR is customized');
  }
};

function customizeLabels(labels: string[], version: string, base_version: string): string[] {
  const new_labels: string[] = [...labels, version];
  if (version !== base_version) {
    new_labels.push('cherry-pick');
  }

  Logger.logInfo(`Final labels: ${new_labels.join(', ')}`);
  return new_labels;
};

export {
  createPullRequest
};
