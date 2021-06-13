import { commands, window } from 'vscode';
import TreeDataProvider from './tree/dataProvider';
import { Action } from './actions';
import GithubClient from './github/client';
import Git from './git/client';

export async function activate () {
  const treeDataProvider = new TreeDataProvider();
  await Git.init();
  await GithubClient.init();

  window.registerTreeDataProvider('GitCherry.main', treeDataProvider);
  commands.registerCommand('GitCherry.pull_request', () => Action.onPullRequest(treeDataProvider));
  commands.registerCommand('GitCherry.cherry_pick', () => Action.onCherryPick(treeDataProvider));
  commands.registerCommand('GitCherry.refresh', () => Action.onRefresh(treeDataProvider));
  commands.registerCommand('GitCherry.continue', () => Action.onContinue());
  commands.registerCommand('GitCherry.abort_cherry_pick', () => Action.onAbortCherryPick());
  commands.registerCommand('GitCherry.unselect_all', () => treeDataProvider.unselectAll(treeDataProvider.tree[0]));
}
