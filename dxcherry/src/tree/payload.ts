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

  // TODO: replace with first commit
  const lastCommit = await Git.getLastCommit();
  Logger.logInfo(`Last commit: ${JSON.stringify(lastCommit)}`);

  if (!lastCommit) {
    Logger.showNoCommitInBranchError(Git.getBranchName());
    return;
  }

  return {
    title: lastCommit.message,
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
