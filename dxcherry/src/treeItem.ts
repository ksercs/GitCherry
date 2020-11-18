import * as vscode from 'vscode';
import * as path from 'path';

export default class ExtendedTreeItem extends vscode.TreeItem {
    constructor(
      public readonly label: string,
      private version: string,
      public readonly collapsibleState: vscode.TreeItemCollapsibleState,
      public readonly command?: vscode.Command) {
      super(label, collapsibleState);
    }

    iconPath = {
      light: path.join(__filename, '..', '..', 'resources', 'test3.svg'),
      dark: path.join(__filename, '..', '..', 'resources', 'test3.svg')
    };
}