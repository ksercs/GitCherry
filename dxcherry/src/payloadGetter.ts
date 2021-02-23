import { TreeDataProvider } from './treeDataProvider';
import { Payload } from './payload';
import Git from './git/git';
import { logInfo } from './info';

export async function payloadGetter (treeDataProvider: TreeDataProvider): Promise<Payload | undefined> {
  logInfo('Payload is getting');
  const lastCommit = await Git.getLastCommit();
  logInfo(`Last commit: ${JSON.stringify(lastCommit)}`);

  if (!lastCommit) {
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
