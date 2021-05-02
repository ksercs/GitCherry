import { getTreePayload, TreePayload } from './tree/payload';
import TreeDataProvider from './tree/dataProvider';
import TreeCreator from './tree/creator';
import { InputBox, window } from 'vscode';
import Logger from './info/Logger';
import { processCherryPickRequest } from './processCherryPickRequest';
import { pushAndCreatePullRequests } from './processPullRequests';
import Git from './git/client';

export class Action {
  static async onPullRequest (treeDataProvider: TreeDataProvider) {
    const payload = await getTreePayload(treeDataProvider);

    if (!payload) {
      Logger.logError('no payload');
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
        await pushAndCreatePullRequests(payload);
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

  static async onContinue () {
    await Git.continueCherryPick();
  }

  static async onAbortCherryPick () {
    await Git.abortCherryPicking();
  }

  static async onCherryPick (treeDataProvider: TreeDataProvider) {
    const payload = await getTreePayload(treeDataProvider);
    await processCherryPickRequest(payload as TreePayload);
  }
}
