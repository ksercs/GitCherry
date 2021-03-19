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

  // TODO: replace with first commit
  const lastCommit = await Git.getLastCommit();
  logInfo(`Last commit: ${JSON.stringify(lastCommit)}`);

  if (!lastCommit) {
    // NOTE: when we work in empty repo with no commits
    // TODO: add error
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
