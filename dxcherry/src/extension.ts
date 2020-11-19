import * as vscode from 'vscode';
import * as path from 'path';
import { EventEmitter } from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  vscode.window.registerTreeDataProvider('exampleView', new TreeDataProvider());
}

class TreeDataProvider implements vscode.TreeDataProvider<ExtendedTreeItem> {
  data: ExtendedTreeItem[];

  constructor() {
    this.data = [new ExtendedTreeItem('Pull request settings', [
      this.getReviewersTree(),
      this.getLabelsTree()
    ])];

    vscode.commands.registerCommand('treeView.selectTreeItem', (element) => this.onItemClicked(element));
    vscode.commands.registerCommand('start', () => this.onStart());
  }

  onStart() {
    const titleInput = vscode.window.createInputBox();
    const values = [];
    titleInput.title = "Enter pull request's title";
    titleInput.totalSteps = 2;
    titleInput.step = 1;
    titleInput.onDidAccept(() => {
      values.push(titleInput.value);
      if(titleInput.step === 1) {
        titleInput.value = "";
        titleInput.step = 2;
        titleInput.title = "Enter pull request's description";
      } else {
        titleInput.dispose();
        vscode.window.showInformationMessage(values.join(' _ '));
        // pass values to the next step
      }
    });
    titleInput.show();
  }

  getReviewersTree(): ExtendedTreeItem {
    return new ExtendedTreeItem('Reviewers', [
      new ExtendedTreeItem('ksercs'),
      new ExtendedTreeItem('jtoming830')
    ]);
  }

  getLabelsTree(): ExtendedTreeItem {
    return new ExtendedTreeItem('Labels', [
      new ExtendedTreeItem('bug'),
      new ExtendedTreeItem('wontfix'),
      new ExtendedTreeItem('invalid'),
      new ExtendedTreeItem('question'),
      new ExtendedTreeItem('duplicate')
    ]);
  }

  setIcon(element: ExtendedTreeItem) {
    if(element.children?.length) {
      return;
    }

    if(element.selected) {
      element.iconPath = {
        light: path.join(__filename, '..', '..', 'resources', 'light', 'checked.svg'),
        dark: path.join(__filename, '..', '..', 'resources', 'dark', 'checked.svg')
      };
    } else {
      element.iconPath = {
        light: path.join(__filename, '..', '..', 'resources', 'light', 'unchecked.svg'),
        dark: path.join(__filename, '..', '..', 'resources', 'dark', 'unchecked.svg')
      };
    }
  }

  getTreeItem(element: ExtendedTreeItem): ExtendedTreeItem|Thenable<ExtendedTreeItem> {
    this.setIcon(element);
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

class ExtendedTreeItem extends vscode.TreeItem {
  children: ExtendedTreeItem[]|undefined;
  selected: boolean;

  constructor(label: string, children?: ExtendedTreeItem[]) {
    super(
        label,
        children === undefined ? vscode.TreeItemCollapsibleState.None :
                                 vscode.TreeItemCollapsibleState.Expanded);
    this.children = children;
    this.selected = false;
  }
}
