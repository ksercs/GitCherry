import { commands, ExtensionContext, window } from 'vscode';
import TreeDataProvider from './tree/dataProvider';
import { Action } from './actions';
import Storage from './reviewers/storage';
import GithubClient from './github/client';
import Git from './git/client';

export async function activate (context: ExtensionContext) {
  const treeDataProvider = new TreeDataProvider();
  await Git.init();
  await GithubClient.init();
  Storage.setStorage(context.globalState);

  window.registerTreeDataProvider('main', treeDataProvider);
  commands.registerCommand('start', () => Action.onStart(treeDataProvider));
  commands.registerCommand('refresh', () => Action.onRefresh(treeDataProvider));
}
