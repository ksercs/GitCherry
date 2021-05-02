import GithubClient from './client';
import Git from '../git/client';
import Logger from '../info/logger';
import { TreePayload } from '../tree/payload';

async function createPullRequest ({ title, description, labels, reviewers }: TreePayload, baseUpstreamBranch: string) {
  const branch = await Git.getBranchName();
  const upstreamBranch = Git.parseBranch(branch)[1];

  Logger.logInfo(`Start PR creating: ${upstreamBranch}`);
  const { login } = await GithubClient.getUser();
  Logger.logInfo(`login: ${login}`);

  const head = Git.isRemoteUpstream() ? `${login}:${branch}` : branch;
  const pullRequest = await GithubClient.createPullRequest(head, upstreamBranch, title, description);

  labels = await customizeLabels(labels, upstreamBranch, baseUpstreamBranch);

  if (pullRequest?.status === 201) {
    const pullRequestNumber = pullRequest.data.number;

    await GithubClient.setLabels(pullRequestNumber, labels);
    await GithubClient.addAssign(pullRequestNumber, [login]);
    await GithubClient.addReviewers(pullRequestNumber, reviewers);
    Logger.logInfo('PR is customized');
  }
};

async function customizeLabels (labels: string[], upstreamBranch: string, baseUpstreamBranch: string): Promise<string[]> {
  const repoLabels = (await GithubClient.getLabels()).map((label: {name: string}) => label.name);
  const newLabels: string[] = [...labels];

  if (repoLabels.includes(upstreamBranch)) {
    newLabels.push(upstreamBranch);
  }
  if (upstreamBranch !== baseUpstreamBranch && repoLabels.includes('cherry-pick')) {
    newLabels.push('cherry-pick');
  }

  Logger.logInfo(`Final labels: ${newLabels.join(', ')}`);
  return newLabels;
};

export {
  createPullRequest
};
