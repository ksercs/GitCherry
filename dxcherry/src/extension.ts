import { commands, ExtensionContext, window } from 'vscode';
import { TreeDataProvider } from './treeDataProvider';
import { Action } from './actions';

export function activate(context: ExtensionContext) {
  const treeDataProvider = new TreeDataProvider();
  window.registerTreeDataProvider('exampleView', treeDataProvider);
  commands.registerCommand('start', () => Action.onStart(treeDataProvider));
}