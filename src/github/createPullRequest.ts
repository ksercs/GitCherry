import GithubClient from './client';
import Git from '../git/client';
import Logger from '../info/Logger';
import { TreePayload } from '../tree/payload';

async function createPullRequest ({ title, description, labels, reviewers }: TreePayload, upstreamBranch: string) {
  const branch = await Git.getBranchName();

  Logger.logInfo(`Start PR creating: ${upstreamBranch}`);
  const { login } = await GithubClient.getUser();
  Logger.logInfo(`login: ${login}`);

  const head = Git.isRemoteUpstream() ? `${login}:${branch}` : branch;
  const pullRequest = await GithubClient.createPullRequest(head, upstreamBranch, title, description);

  if (pullRequest?.status === 201) {
    const pullRequestNumber = pullRequest.data.number;

    await GithubClient.setLabels(pullRequestNumber, labels);
    await GithubClient.addAssign(pullRequestNumber, [login]);
    await GithubClient.addReviewers(pullRequestNumber, reviewers);
    Logger.logInfo('PR is customized');
  }
};

export {
  createPullRequest
};
