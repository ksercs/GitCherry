import GithubClient from './client';
import { getBranchName } from '../git/branch';
import { logInfo } from '../info';

async function createPullRequest ({ title, description, versions, reviewers, labels }: any) {
  logInfo('Start pull requests creating');
  const { login } = await GithubClient.getUser();
  const branch = await getBranchName();
  const branchWithoutVersion = branch.match('(.*)_[0-9]*_[0-9]*')[1];

  logInfo(`login: ${login}, branch: ${branch}, branchWithoutVersion: ${branchWithoutVersion}`);

  versions.forEach(async (version: string, index: number) => {
      const pullRequest = await GithubClient.createPullRequest(login, branchWithoutVersion, version, title, description);

      if (pullRequest?.status === 201) {
        const pullRequestNumber = pullRequest.data.number;

        if (index !== versions.length - 1) {
          // TODO
          // labels.push('cherry-pick');
        }
  
        await GithubClient.setLabels(pullRequestNumber, [...labels, version]);
        await GithubClient.addAssign(pullRequestNumber, [login]);
        await GithubClient.addReviewers(pullRequestNumber, reviewers);
      }
  });
};

export {
  createPullRequest
};
