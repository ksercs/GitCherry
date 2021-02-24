// import './github/config'; // NOTE: For process.env configuration
import { commands, ExtensionContext, window } from 'vscode';
import { TreeDataProvider } from './treeDataProvider';
import { Action } from './actions';
import Storage from './storage';
import { createClient } from './github/createClient';
import Git from './git/git';

export async function activate (context: ExtensionContext) {
  const treeDataProvider = new TreeDataProvider();
  await createClient();
  await Git.init();
  Storage.setStorage(context.globalState);

  window.registerTreeDataProvider('main', treeDataProvider);
  commands.registerCommand('start', () => Action.onStart(treeDataProvider));
  commands.registerCommand('refresh', () => Action.onRefresh(treeDataProvider));
}
