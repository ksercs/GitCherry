import { TreeDataProvider } from './treeDataProvider';
import Git from './git/git';
import { logInfo } from './info';

interface Payload {
  title: string,
  description: string,
  versions: string[],
  reviewers: string[],
  labels: string[]
};

async function getPayload (treeDataProvider: TreeDataProvider): Promise<Payload | undefined> {
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
    getPayload,
    Payload
};
