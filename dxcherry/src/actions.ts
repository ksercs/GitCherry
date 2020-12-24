import { payloadGetter } from './payloadGetter';
import { TreeDataProvider } from './treeDataProvider';
import TreeCreator from './treeCreator';
import { InputBox, window } from 'vscode';
import { createPullRequest } from './github/createPullRequest';
import { Payload } from './payload';
import log from './log';

export class Action {
  static async onStart (treeDataProvider: TreeDataProvider) {
    log.appendLine('start creating pull requests');
    const payload = await payloadGetter(treeDataProvider);
    log.appendLine(`payload: ${JSON.stringify(payload)}`);

    if (!payload) {
      return;
    }

    const titleInput = this.createTitleInput(payload);

    titleInput.onDidAccept(async () => {
      if (titleInput.step === 1) {
        log.appendLine(`accepted with title: ${titleInput.value}`);
        payload.title = titleInput.value;
        this.createDescriptionInput(titleInput, payload);
      } else {
        log.appendLine(`accepted with description: ${titleInput.value}`);
        payload.description = titleInput.value;
        titleInput.dispose();
        await createPullRequest(payload);
      }
    });

    titleInput.show();
    log.appendLine('titleInput was shown');
  }

  private static async createDescriptionInput (input: InputBox, payload: Payload) {
    log.appendLine('created description input');
    input.value = '';
    input.step = 2;
    input.title = "Enter pull request's description";
  }

  private static createTitleInput (payload: Payload) : InputBox {
    const titleInput = window.createInputBox();

    titleInput.title = "Enter pull request's title";
    titleInput.value = payload.title;
    titleInput.totalSteps = 2;
    titleInput.step = 1;

    return titleInput;
  }

  static async onRefresh (treeDataProvider: TreeDataProvider) {
    log.appendLine('start refreshing');
    treeDataProvider.tree = await TreeCreator.createTree(true);
    log.appendLine('tree is created');
    treeDataProvider.refresh();
    log.appendLine('tree is refreshed');
  }
}
