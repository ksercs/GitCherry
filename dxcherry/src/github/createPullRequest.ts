import { getClient } from './createClient';
import { getUser } from '../github/getters';
import { getBranchName } from '../git/branch';
import Git from '../git/git';
import { logInfo, showInfo } from '../info';
import { PullRequestCreatingError } from '../info/errors/pullRequestCreatingError';

async function setLabels (issueNumber: number, labels: string[]) {
  await getClient().issues.setLabels(Object.assign({}, Git.getRepoData(), { issue_number: issueNumber, labels }));
};

async function addAssign (issueNumber: number, assignees: string[]) {
  await getClient().issues.addAssignees(Object.assign({}, Git.getRepoData(), { issue_number: issueNumber, assignees }));
};

async function addReviewers (pullNumber: number, reviewers: string[]) {
  await getClient().pulls.requestReviewers(Object.assign({}, Git.getRepoData(), { pull_number: pullNumber, reviewers }));
};

async function createPullRequest ({ title, description, versions, reviewers, labels }: any) {
  logInfo('Start pull requests creating');
  const { login } = await getUser();
  const branch = await getBranchName();
  const branchWithoutVersion = branch.match('(.*)_[0-9]*_[0-9]*')[1];

  logInfo(`login: ${login}, branch: ${branch}, branchWithoutVersion: ${branchWithoutVersion}`);

  versions.forEach(async (version: string, index: number) => {
    const payload = Object.assign({},
      Git.getRepoData(), {
        base: version,
        head: `${login}:${branchWithoutVersion}_${version}`,
        title,
        body: description
      });

    const creatingError = new PullRequestCreatingError(payload.head, version);
    logInfo(`payload: ${JSON.stringify(payload)}`);
    try {
      const pullRequest = await getClient().pulls.create(payload);
      logInfo(`Pull request creation response: ${JSON.stringify(pullRequest)}`);
      if (pullRequest.status === 201) {
        logInfo('Pull request is created');
        showInfo(`Pull request from ${payload.head} to ${version} was successfully created`);
      } else {
        logInfo(pullRequest.status + '');
        creatingError.show();
      }
      const pullRequestNumber = pullRequest.data.number;

      if (index !== versions.length - 1) {
        // TODO
        // labels.push('cherry-pick');
      }

      await setLabels(pullRequestNumber, [...labels, version]);
      await addAssign(pullRequestNumber, [login]);
      await addReviewers(pullRequestNumber, reviewers);
    } catch (err) {
      logInfo(err);
      creatingError.show();
    }
  });
};

export {
  createPullRequest
};
