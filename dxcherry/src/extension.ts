import * as vscode from 'vscode';
import * as path from 'path';
import { EventEmitter } from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  vscode.window.registerTreeDataProvider('exampleView', new TreeDataProvider());
}

class TreeDataProvider implements vscode.TreeDataProvider<extendedTreeItem> {
  data: extendedTreeItem[];

  constructor() {
    this.data = [new extendedTreeItem('Pull request settings', [
      this.getReviewersTree(),
      this.getLabelsTree()
    ])];

		vscode.commands.registerCommand('treeView.selectTreeItem', (element) => this.onItemClicked(element));
  }

  getReviewersTree(): extendedTreeItem {
    return new extendedTreeItem('Reviewers', [
      new extendedTreeItem('ksercs'),
      new extendedTreeItem('jtoming830')
    ]);
  }

  getLabelsTree(): extendedTreeItem {
    return new extendedTreeItem('Labels', [
      new extendedTreeItem('bug'),
      new extendedTreeItem('wontfix'),
      new extendedTreeItem('invalid'),
      new extendedTreeItem('question'),
      new extendedTreeItem('duplicate')
    ]);
  }

  setIcon(element: extendedTreeItem) {
    if(element.children?.length) {
      return;
    }

    if(element.selected) {
      element.iconPath = {
        light: path.join(__filename, '..', '..', 'resources', 'checked.svg'),
        dark: path.join(__filename, '..', '..', 'resources', 'checked.svg')
      }
    } else {
      element.iconPath = {
        light: path.join(__filename, '..', '..', 'resources', 'unchecked.svg'),
        dark: path.join(__filename, '..', '..', 'resources', 'unchecked.svg')
      }
    }
  }

  getTreeItem(element: extendedTreeItem): extendedTreeItem|Thenable<extendedTreeItem> {
    this.setIcon(element);
    element.command = { command: 'treeView.selectTreeItem', title: "Select item", arguments: [element], };
    return element;
  }

  private _onDidChangeTreeData: EventEmitter<
    extendedTreeItem | null
  > = new EventEmitter<extendedTreeItem | null>();

  readonly onDidChangeTreeData: Event<extendedTreeItem | null> = this
    ._onDidChangeTreeData.event;

  refresh(element: extendedTreeItem | null): void {
    this._onDidChangeTreeData.fire(element);
  }

  onItemClicked(element: extendedTreeItem) {
    element.selected = !element.selected;
    this.refresh(element);
  }

  getChildren(element?: extendedTreeItem|undefined): vscode.ProviderResult<extendedTreeItem[]> {
    if (element === undefined) {
      return this.data;
    }
    return element.children;
  }
}

class extendedTreeItem extends vscode.TreeItem {
  children: extendedTreeItem[]|undefined;
  selected: boolean;

  constructor(label: string, children?: extendedTreeItem[]) {
    super(
        label,
        children === undefined ? vscode.TreeItemCollapsibleState.None :
                                 vscode.TreeItemCollapsibleState.Expanded);
    this.children = children;
    this.selected = false;
  }
}