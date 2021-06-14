import { commands, ExtensionContext, window } from 'vscode';
import TreeDataProvider from './tree/dataProvider';
import { Action } from './actions';
import Storage from './storage';
import GithubClient from './github/client';
import Git from './git/client';

export async function activate (context: ExtensionContext) {
  const treeDataProvider = new TreeDataProvider();
  await Git.init();
  await GithubClient.init();
  Storage.setStorage(context.globalState);

  window.createTreeView('TestGitCherry.main', { treeDataProvider, showCollapseAll: true });
  commands.registerCommand('TestGitCherry.pull_request', () => Action.onPullRequest(treeDataProvider));
  commands.registerCommand('TestGitCherry.cherry_pick', () => Action.onCherryPick(treeDataProvider));
  commands.registerCommand('TestGitCherry.refresh', () => Action.onRefresh(treeDataProvider));
  commands.registerCommand('TestGitCherry.continue', () => Action.onContinue());
  commands.registerCommand('TestGitCherry.abort_cherry_pick', () => Action.onAbortCherryPick());
  commands.registerCommand('TestGitCherry.unselect_all', (item) => treeDataProvider.unselectAll(item));
}
