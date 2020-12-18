import './github/config'; // NOTE: For process.env configuration
import { commands, ExtensionContext, window } from 'vscode';
import { TreeDataProvider } from './treeDataProvider';
import { Action } from './actions';
import Storage from './storage';

export function activate (context: ExtensionContext) {
  const treeDataProvider = new TreeDataProvider();
  window.registerTreeDataProvider('exampleView', treeDataProvider);
  commands.registerCommand('start', () => Action.onStart(treeDataProvider));
  commands.registerCommand('refresh', () => Action.onRefresh(treeDataProvider));
  Storage.setStorage(context.globalState);
}
