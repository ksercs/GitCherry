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
    this.contextValue = children ? 'expandable' : '';
  }

  setIcon () {
    if (this.children?.length) {
      return;
    }

    if (this.selected) {
      this.iconPath = {
        light: path.resolve(__filename, '../../resources/light/checked.svg'),
        dark: path.resolve(__filename, '../../resources/dark/checked.svg')
      };
    } else {
      this.iconPath = {
        light: path.resolve(__filename, '../../resources/light/unchecked.svg'),
        dark: path.resolve(__filename, '../../resources/dark/unchecked.svg')
      };
    }
  }

  getSelectedChildrenLabelsArray (): string[] {
    const nodes = [] as Array<ExtendedTreeItem>;

    this.children?.forEach(child => {
      if (child.children) {
        nodes.push(...child.children);
      } else {
        nodes.push(child);
      }
    });

    return nodes?.filter(node => node.selected).map(node => node.label as string);
  }
}
