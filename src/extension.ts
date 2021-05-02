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

  window.registerTreeDataProvider('main', treeDataProvider);
  commands.registerCommand('pull_request', () => Action.onPullRequest(treeDataProvider));
  commands.registerCommand('cherry_pick', () => Action.onCherryPick(treeDataProvider));
  commands.registerCommand('refresh', () => Action.onRefresh(treeDataProvider));
  commands.registerCommand('continue', () => Action.onContinue());
  commands.registerCommand('abort_cherry_pick', () => Action.onAbortCherryPick());
}
