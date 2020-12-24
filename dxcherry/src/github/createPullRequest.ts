import { getClient } from './createClient';
import { getUser } from '../github/getters';
import { getBranchName } from '../git/branch';
import { REPO_DATA } from './config';
import log from '../log';
import { window } from 'vscode';

async function setLabels (issueNumber: number, labels: string[]) {
  await getClient().issues.setLabels(Object.assign({}, REPO_DATA, { issue_number: issueNumber, labels }));
};

async function addAssign (issueNumber: number, assignees: string[]) {
  await getClient().issues.addAssignees(Object.assign({}, REPO_DATA, { issue_number: issueNumber, assignees }));
};

async function addReviewers (pullNumber: number, reviewers: string[]) {
  await getClient().pulls.requestReviewers(Object.assign({}, REPO_DATA, { pull_number: pullNumber, reviewers }));
};

async function createPullRequest ({ title, description, versions, reviewers, labels }: any) {
  log.appendLine('start creating pull requests');
  const { login } = await getUser();
  const branch = await getBranchName();
  const branchWithoutVersion = branch.match('(.*)_[0-9]*_[0-9]*')[1];

  log.appendLine(`login: ${login}, branch: ${branch}, branchWithoutVersion: ${branchWithoutVersion}`);

  versions.forEach(async (version: string, index: number) => {
    const payload = Object.assign({},
      REPO_DATA, {
        base: version,
        head: `${login}:${branchWithoutVersion}_${version}`,
        title,
        body: description
      });
    const errMessage = `Pull request from ${payload.head} to ${version} was not created. Please check, that ${payload.head} was pushed to the fork.`;

    log.appendLine(`payload: ${JSON.stringify(payload)}`);
    try {
      const pullRequest = await getClient().pulls.create(payload);
      log.appendLine(`PR creation response: ${JSON.stringify(pullRequest)}`);
      if (pullRequest.status === 201) {
        log.appendLine('Pull request created!');
        window.showInformationMessage(`Pull request from ${payload.head} to ${version} was successfully created.`);
      } else {
        log.appendLine(pullRequest.status.toString());
        window.showErrorMessage(errMessage);
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
      log.appendLine(err);
      window.showErrorMessage(errMessage);
    }
  });
};

export {
  createPullRequest
};
