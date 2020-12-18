import { payloadGetter } from './payloadGetter';
import { TreeDataProvider } from './treeDataProvider';
import TreeCreator from './treeCreator';
import { window } from 'vscode';

export class Action {
  static onStart (treeDataProvider: TreeDataProvider) {
    const payload = payloadGetter(treeDataProvider);
    const titleInput = window.createInputBox();
    titleInput.title = "Enter pull request's title";
    titleInput.totalSteps = 2;
    titleInput.step = 1;
    titleInput.onDidAccept(() => {
      if (titleInput.step === 1) {
        payload.title = titleInput.value;
        titleInput.value = '';
        titleInput.step = 2;
        titleInput.title = "Enter pull request's description";
      } else {
        payload.description = titleInput.value;
        titleInput.dispose();
      }
    });
    titleInput.show();
  }

  static async onRefresh (treeDataProvider: TreeDataProvider) {
    treeDataProvider.tree = await TreeCreator.createTree(true);
    treeDataProvider.refresh();
  }
}
