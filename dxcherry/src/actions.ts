import { getTreePayload, TreePayload } from './tree/payload';
import TreeDataProvider from './tree/dataProvider';
import TreeCreator from './tree/creator';
import { InputBox, window } from 'vscode';
import Logger from './info/Logger';
import { processCherryPickRequest } from './processCherryPickRequest';

export class Action {
  static async onStart (treeDataProvider: TreeDataProvider) {
    Logger.logInfo('Start pull requests creating');
    const payload = await getTreePayload(treeDataProvider);
    Logger.logInfo(`Payload: ${JSON.stringify(payload)}`);

    if (!payload) {
      return;
    }

    const titleInput = this.createTitleInput(payload);

    titleInput.onDidAccept(async () => {
      if (titleInput.step === 1) {
        Logger.logInfo(`Accepted title: ${titleInput.value}`);
        payload.title = titleInput.value;
        this.createDescriptionInput(titleInput, payload);
      } else {
        Logger.logInfo(`Accepted description: ${titleInput.value}`);
        payload.description = titleInput.value;
        titleInput.dispose();
        await processCherryPickRequest(payload);
      }
    });

    titleInput.show();
    Logger.logInfo('Title input is shown');
  }

  private static async createDescriptionInput (input: InputBox, payload: TreePayload) {
    Logger.logInfo('Description input is created');
    input.value = '';
    input.step = 2;
    input.title = 'Enter pull request description';
  }

  private static createTitleInput (payload: TreePayload) : InputBox {
    const titleInput = window.createInputBox();

    titleInput.title = 'Enter pull request title';
    titleInput.value = payload.title;
    titleInput.totalSteps = 2;
    titleInput.step = 1;

    return titleInput;
  }

  static async onRefresh (treeDataProvider: TreeDataProvider) {
    Logger.logInfo('Start refreshing');
    treeDataProvider.tree = await TreeCreator.createTree(true);
    Logger.logInfo('Tree is created');
    treeDataProvider.refresh();
    Logger.logInfo('Tree is refreshed');
  }
}
