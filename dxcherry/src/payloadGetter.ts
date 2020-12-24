import { TreeDataProvider } from './treeDataProvider';
import { Payload } from './payload';
import Git from './git/git';
import log from './log';

export async function payloadGetter (treeDataProvider: TreeDataProvider): Promise<Payload | undefined> {
  log.appendLine('getting payload');
  const lastCommit = await Git.getLastCommit();
  log.appendLine(`last commit: ${JSON.stringify(lastCommit)}`);

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
