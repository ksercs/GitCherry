import TreeDataProvider from './dataProvider';
import Git from '../git/client';
import { logInfo } from '../info';

interface TreePayload {
  title: string,
  description: string,
  versions: string[],
  reviewers: string[],
  labels: string[]
};

async function getTreePayload (treeDataProvider: TreeDataProvider): Promise<TreePayload | undefined> {
  logInfo('Payload is getting');

  const lastCommit = await Git.getLastCommit();
  logInfo(`Last commit: ${JSON.stringify(lastCommit)}`);

  if (!lastCommit) {
    // TODO: when is there no last commit?
    // TODO: replace with first commit
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
