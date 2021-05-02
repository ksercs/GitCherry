import { TreeItem, TreeItemCollapsibleState } from 'vscode';
import * as path from 'path';

export const UPSTREAM_ROOT_LABEL = 'Upstream branches';
export const REVIEWERS_ROOT_LABEL = 'Reviewers';
export const LABELS_ROOT_LABEL = 'Labels';

export class ExtendedTreeItem extends TreeItem {
  children: ExtendedTreeItem[]|undefined;
  selected: boolean;

  constructor (label: string, children?: ExtendedTreeItem[], expanded?: boolean) {
    const state = children ? (expanded ? TreeItemCollapsibleState.Expanded : TreeItemCollapsibleState.Collapsed) : TreeItemCollapsibleState.None;
    super(label, state);
    this.children = children;
    this.selected = false;
  }

  setIcon () {
    if (this.children?.length) {
      return;
    }

    if (this.selected) {
      this.iconPath = {
        light: path.join(__filename, '..', '..', '..', 'resources', 'light', 'checked.svg'),
        dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', 'checked.svg')
      };
    } else {
      this.iconPath = {
        light: path.join(__filename, '..', '..', '..', 'resources', 'light', 'unchecked.svg'),
        dark: path.join(__filename, '..', '..', '..', 'resources', 'dark', 'unchecked.svg')
      };
    }
  }

  getSelectedChildrenLabelsArray (): string[] {
    let nodes = [] as Array<ExtendedTreeItem>;

    this.children?.forEach(child => {
      if (child.children) {
        nodes.push(...child.children);
      }
    });

    if (nodes.length === 0) {
      nodes = this.children ?? [];
    }

    return nodes?.filter(node => node.selected).map(node => node.label as string);
  }
}
