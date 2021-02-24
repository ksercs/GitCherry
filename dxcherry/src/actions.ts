import { payloadGetter } from './payloadGetter';
import { TreeDataProvider } from './treeDataProvider';
import TreeCreator from './treeCreator';
import { InputBox, window } from 'vscode';
import { Payload } from './payload';
import { logInfo } from './info';
import { processCherryPickRequest } from './processCherryPickRequest';

export class Action {
  static async onStart (treeDataProvider: TreeDataProvider) {
    logInfo('Start pull requests creating');
    const payload = await payloadGetter(treeDataProvider);
    logInfo(`Payload: ${JSON.stringify(payload)}`);

    if (!payload) {
      return;
    }

    const titleInput = this.createTitleInput(payload);

    titleInput.onDidAccept(async () => {
      if (titleInput.step === 1) {
        logInfo(`Accepted title: ${titleInput.value}`);
        payload.title = titleInput.value;
        this.createDescriptionInput(titleInput, payload);
      } else {
        logInfo(`Accepted description: ${titleInput.value}`);
        payload.description = titleInput.value;
        titleInput.dispose();
        await processCherryPickRequest(payload);
      }
    });

    titleInput.show();
    logInfo('Title input is shown');
  }

  private static async createDescriptionInput (input: InputBox, payload: Payload) {
    logInfo('Description input is created');
    input.value = '';
    input.step = 2;
    input.title = "Enter pull request description";
  }

  private static createTitleInput (payload: Payload) : InputBox {
    const titleInput = window.createInputBox();

    titleInput.title = "Enter pull request title";
    titleInput.value = payload.title;
    titleInput.totalSteps = 2;
    titleInput.step = 1;

    return titleInput;
  }

  static async onRefresh (treeDataProvider: TreeDataProvider) {
    logInfo('Start refreshing');
    treeDataProvider.tree = await TreeCreator.createTree(true);
    logInfo('Tree is created');
    treeDataProvider.refresh();
    logInfo('Tree is refreshed');
  }
}
