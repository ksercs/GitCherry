import { EventEmitter, Event, commands } from 'vscode';
import * as vscode from 'vscode';
import { ExtendedTreeItem, REVIEWERS_ROOT_LABEL, LABELS_ROOT_LABEL, UPSTREAM_ROOT_LABEL } from './item';
import TreeCreator from './creator';

export default class TreeDataProvider implements vscode.TreeDataProvider<ExtendedTreeItem> {
  tree!: ExtendedTreeItem[];

  constructor () {
    commands.registerCommand('GitCherry.treeView.selectTreeItem', (element) => this.onItemClicked(element));
  }

  getSelectedUpstreams (): string[] {
    return this.getSelectedByRootLabel(UPSTREAM_ROOT_LABEL);
  }

  getSelectedReviewers (): string[] {
    return this.getSelectedByRootLabel(REVIEWERS_ROOT_LABEL);
  }

  getSelectedLabels (): string[] {
    return this.getSelectedByRootLabel(LABELS_ROOT_LABEL);
  }

  getSelectedByRootLabel (rootLabel: string): string[] {
    const root = this.getTree(rootLabel);
    return root?.getSelectedChildrenLabelsArray() || [];
  }

  getTree (label: string): ExtendedTreeItem | undefined {
    return this.tree[0].children?.find(child => child.label === label);
  }

  // eslint-disable-next-line no-undef
  getTreeItem (element: ExtendedTreeItem): ExtendedTreeItem|Thenable<ExtendedTreeItem> {
    element.setIcon();
    element.command = { command: 'GitCherry.treeView.selectTreeItem', title: 'Select item', arguments: [element] };
    return element;
  }

  private _onDidChangeTreeData: EventEmitter<ExtendedTreeItem | null> = new EventEmitter<ExtendedTreeItem | null>();

  readonly onDidChangeTreeData: Event<ExtendedTreeItem | null> = this._onDidChangeTreeData.event;

  refresh (element: (ExtendedTreeItem | null) = null): void {
    this._onDidChangeTreeData.fire(element);
  }

  onItemClicked (element: ExtendedTreeItem) {
    element.selected = !element.selected;
    this.refresh(element);
  }

  async getChildren (element?: ExtendedTreeItem|undefined): Promise<ExtendedTreeItem[]|undefined> {
    if (element === undefined) {
      this.tree = await TreeCreator.createTree();
      return Promise.resolve(this.tree);
    }
    return Promise.resolve(element.children);
  }

  unselectItem (element: ExtendedTreeItem) {
    if (!element.children) {
      element.selected = false;
      return;
    }

    element.children.forEach(element => {
      this.unselectItem(element);
    });
  }

  unselectAll (element: ExtendedTreeItem) {
    this.unselectItem(element);
    this.refresh();
  }
}
