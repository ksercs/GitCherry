import { TreeItem, TreeItemCollapsibleState } from 'vscode';
import * as path from 'path';

export const VERSION_ROOT_LABEL = 'Upstream branches';
export const REVIEWERS_ROOT_LABEL = 'Reviewers';
export const LABELS_ROOT_LABEL = 'Labels';

export class ExtendedTreeItem extends TreeItem {
  children: ExtendedTreeItem[]|undefined;
  selected: boolean;

  constructor(label: string, children?: ExtendedTreeItem[]) {
    super(
        label,
        children === undefined ? TreeItemCollapsibleState.None :
                                  TreeItemCollapsibleState.Expanded);
    this.children = children;
    this.selected = false;
  }

  setIcon() {
    if(this.children?.length) {
      return;
    }

    if(this.selected) {
      this.iconPath = {
        light: path.join(__filename, '..', '..', 'resources', 'light', 'checked.svg'),
        dark: path.join(__filename, '..', '..', 'resources', 'dark', 'checked.svg')
      };
    } else {
      this.iconPath = {
        light: path.join(__filename, '..', '..', 'resources', 'light', 'unchecked.svg'),
        dark: path.join(__filename, '..', '..', 'resources', 'dark', 'unchecked.svg')
      };
    }
  }
  
  getSelectedChildrenLabelsArray(): Array<string | undefined> {
    return this.children?.filter(child => child.selected)
                          .map(child => child.label) || [];
  }
}
