import TreeDataProvider from './dataProvider';
import Git from '../git/client';
import Logger from '../info/Logger';

interface TreePayload {
  title: string,
  description: string,
  versions: string[],
  reviewers: string[],
  labels: string[]
};

async function getTreePayload (treeDataProvider: TreeDataProvider): Promise<TreePayload | undefined> {
  Logger.logInfo('Payload is getting');

  const firstCommit = await Git.getFirstCommit();
  Logger.logInfo(`First commit: ${JSON.stringify(firstCommit)}`);

  if (!firstCommit) {
    Logger.showNoCommitInBranchError(Git.getBranchName());
    return;
  }

  return {
    title: firstCommit.message,
    description: '',
    versions: treeDataProvider.getSelectedVersions(),
    reviewers: treeDataProvider.getSelectedReviewers(),
    labels: treeDataProvider.getSelectedLabels()
  };
}

export {
  getTreePayload,
  TreePayload
};
