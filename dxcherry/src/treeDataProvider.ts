import { EventEmitter, Event, commands } from 'vscode';
import * as vscode from 'vscode';
import { ExtendedTreeItem, REVIEWERS_ROOT_LABEL, LABELS_ROOT_LABEL, VERSION_ROOT_LABEL } from './treeItem';
import { TreeCreator } from './treeCreator';

export class TreeDataProvider implements vscode.TreeDataProvider<ExtendedTreeItem> {
  tree!: ExtendedTreeItem[];

  constructor() {
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
    return this.tree[0].children?.find(child => child.label === label);
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

  async getChildren(element?: ExtendedTreeItem|undefined): Promise<ExtendedTreeItem[]|undefined> {
    if (element === undefined) {
      this.tree = await TreeCreator.createTree();
      return Promise.resolve(this.tree);
    }
    return Promise.resolve(element.children);
  }
}
