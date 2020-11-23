import { EventEmitter, commands } from 'vscode';
import * as vscode from 'vscode';
import { ExtendedTreeItem, REVIEWERS_ROOT_LABEL, LABELS_ROOT_LABEL, VERSION_ROOT_LABEL } from './treeItem';
import { TreeCreator } from './treeCreator';

export class TreeDataProvider implements vscode.TreeDataProvider<ExtendedTreeItem> {
  data: ExtendedTreeItem[];

  constructor() {
    this.data = [new ExtendedTreeItem('Pull request settings', [
      TreeCreator.createVersionsTree(),
      TreeCreator.createReviewersTree(),
      TreeCreator.createLabelsTree(),
    ])];

    commands.registerCommand('treeView.selectTreeItem', (element) => this.onItemClicked(element));
  }

  getSelectedVersions(): Array<string | undefined> {
    return this.getSelectedByRootLabel(VERSION_ROOT_LABEL);
  }

  getSelectedReviewers(): Array<string | undefined> {
    return this.getSelectedByRootLabel(REVIEWERS_ROOT_LABEL);
  }

  getSelectedLabels(): Array<string | undefined> {
    return this.getSelectedByRootLabel(LABELS_ROOT_LABEL);
  }

  getSelectedByRootLabel(rootLabel: string): Array<string | undefined> {
    const root = this.getTree(rootLabel);
    return root?.getSelectedChildrenLabelsArray() || [];
  }

  getTree(label: string): ExtendedTreeItem | undefined {
    return this.data[0].children?.find(child => child.label === label);
  }

  getTreeItem(element: ExtendedTreeItem): ExtendedTreeItem|Thenable<ExtendedTreeItem> {
    element.setIcon();
    element.command = { command: 'treeView.selectTreeItem', title: "Select item", arguments: [element], };
    return element;
  }

  private _onDidChangeTreeData: EventEmitter<ExtendedTreeItem | null> = new EventEmitter<ExtendedTreeItem | null>();

  readonly onDidChangeTreeData: Event<ExtendedTreeItem | null> = this._onDidChangeTreeData.event;

  refresh(element: ExtendedTreeItem | null): void {
    this._onDidChangeTreeData.fire(element);
  }

  onItemClicked(element: ExtendedTreeItem) {
    element.selected = !element.selected;
    this.refresh(element);
  }

  getChildren(element?: ExtendedTreeItem|undefined): vscode.ProviderResult<ExtendedTreeItem[]> {
    if (element === undefined) {
      return this.data;
    }
    return element.children;
  }
}
