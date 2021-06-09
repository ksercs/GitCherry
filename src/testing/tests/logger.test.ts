import { assert } from 'chai';
import { describe, test, beforeEach, afterEach } from 'mocha';
import * as sinon from 'sinon';
import * as vs from 'vscode';

import Logger from '../../info/logger';
import log from '../../info/log';

describe('Logger', function () {
  describe('common api', function () {
    describe('logging', function () {
      let logSpy: sinon.SinonSpy<[value: string], void>;

      beforeEach(function () {
        logSpy = sinon.spy(log, 'appendLine');
      });
      afterEach(function () {
        logSpy.restore();
      });

      test('logError', () => {
        const errorMessage = 'my error';
        Logger.logError(errorMessage);

        assert.ok(logSpy.calledWith(`ERROR: ${errorMessage}`), 'error was logged');
      });

      test('logMessage', () => {
        const message = 'me message';
        Logger.logInfo(message);

        assert.ok(logSpy.calledWith(`INFO: ${message}`), 'info message was logged');
      });

      test('logWarning', () => {
        const warning = 'my warning';
        Logger.logWarning(warning);

        assert.ok(logSpy.calledWith(`WARNING: ${warning}`), 'warning was logged');
      });
    });

    describe('showing', function () {
      test('showError', () => {
        const logErrorSpy = sinon.spy(Logger, 'logError');
        const showErrorMessageSpy = sinon.spy(vs.window, 'showErrorMessage');

        try {
          const errorMessage = 'my error';
          Logger.showError(errorMessage);

          assert.ok(logErrorSpy.calledWith(errorMessage), 'error message was logged');
          assert.ok(showErrorMessageSpy.calledWith(errorMessage), 'vs code showed an error message');
        } finally {
          logErrorSpy.restore();
          showErrorMessageSpy.restore();
        }
      });

      test('showWarning', () => {
        const logWarningSpy = sinon.spy(Logger, 'logWarning');
        const showWarningMessageSpy = sinon.spy(vs.window, 'showWarningMessage');

        try {
          const warning = 'my warning';
          Logger.showWarning(warning);

          assert.ok(logWarningSpy.calledWith(warning), 'warning was logged');
          assert.ok(showWarningMessageSpy.calledWith(warning), 'vs code showed a warning');
        } finally {
          logWarningSpy.restore();
          showWarningMessageSpy.restore();
        }
      });

      test('showInfo', () => {
        const logInfoSpy = sinon.spy(Logger, 'logInfo');
        const showInfoMessageSpy = sinon.spy(vs.window, 'showInformationMessage');

        try {
          const message = 'my warning';
          Logger.showInfo(message);

          assert.ok(logInfoSpy.calledWith(message), 'message was logged');
          assert.ok(showInfoMessageSpy.calledWith(message), 'vs code showed a message');
        } finally {
          logInfoSpy.restore();
          showInfoMessageSpy.restore();
        }
      });
    });
  });

  test('showPullRequestCreatingMessage', () => {
    const logInfoSpy = sinon.spy(Logger, 'logInfo');
    const showInfoMessageSpy = sinon.spy(vs.window, 'showInformationMessage');

    try {
      const message = 'my message';
      const url = 'https://github.com/ksercs/GitCherry/pull/49';

      Logger.showPullRequestCreatingMessage(message, url);

      assert.ok(logInfoSpy.calledWith(`${message}: ${url}`), 'message was logged');
      assert.ok(showInfoMessageSpy.calledWith(message, 'Open' as vs.MessageOptions), 'vs code showed a message and button'); ;
    } finally {
      logInfoSpy.restore();
      showInfoMessageSpy.restore();
    }
  });

  describe('special errors', function () {
    let showErrorSpy: sinon.SinonSpy<any[], any> | sinon.SinonSpy<unknown[], unknown>;
    let logErrorSpy: sinon.SinonSpy<any[], any> | sinon.SinonSpy<unknown[], unknown>;
    const checkErrors = (expectedMessage: string): void => {
      assert.strictEqual(logErrorSpy.getCall(0).args[0], expectedMessage, 'error message was logged');
      assert.strictEqual(showErrorSpy.getCall(0).args[0], expectedMessage, 'vs code showed an error message');
    };

    beforeEach(function () {
      showErrorSpy = sinon.spy(Logger, 'showError');
      logErrorSpy = sinon.spy(Logger, 'logError');
    });
    afterEach(function () {
      showErrorSpy.restore();
      logErrorSpy.restore();
    });

    test('PullRequestCreatingError', () => {
      Logger.showPullRequestCreatingError('a', 'b', 'c');
      const expectedMessage = 'Pull request from a to b was not created! c';

      checkErrors(expectedMessage);
    });

    test('RepoNotFoundError', () => {
      Logger.showRepoNotFoundError();
      const expectedMessage = 'Repository is not found. Check that a git repository is opened.';

      checkErrors(expectedMessage);
    });

    test('MissingGithubTokenError', () => {
      Logger.showMissingGithubTokenError();
      const expectedMessage = 'Missing Github token.';

      checkErrors(expectedMessage);
    });

    test('NoFirstCommitError', () => {
      Logger.showNoFirstCommitError();
      const expectedMessage = 'No first commit found. Check that a git repository is opened.';

      checkErrors(expectedMessage);
    });

    test('IncorrectBranchNameError', () => {
      Logger.showIncorrectBranchNameError('NAME');
      const expectedMessage = '"NAME" is not a correct branch name. Name your branch as *branch__upstream*';

      checkErrors(expectedMessage);
    });

    test('NoCommitInBranchError', () => {
      Logger.showNoCommitInBranchError('NAME');
      const expectedMessage = 'There is no new commits in "NAME" branch.';

      checkErrors(expectedMessage);
    });

    test('NoLocalBranchError', () => {
      Logger.showNoLocalBranchError('NAME');
      const expectedMessage = 'Branch "NAME" does not exist. Did you forget to cherry-pick?';

      checkErrors(expectedMessage);
    });

    test('NotStagedChangesFoundError', () => {
      Logger.showNotStagedChangesFoundError('Something went wrong');
      const expectedMessage = 'Not staged changes are found. Something went wrong';

      checkErrors(expectedMessage);
    });
  });

  describe('special warnings', function () {
    let showWarningSpy: sinon.SinonSpy<any[], any> | sinon.SinonSpy<unknown[], unknown>;
    let logWarningSpy: sinon.SinonSpy<any[], any> | sinon.SinonSpy<unknown[], unknown>;
    const checkWarnings = (expectedMessage: string): void => {
      assert.strictEqual(logWarningSpy.getCall(0).args[0], expectedMessage, 'warning was logged');
      assert.strictEqual(showWarningSpy.getCall(0).args[0], expectedMessage, 'vs code showed a warning');
    };

    beforeEach(function () {
      showWarningSpy = sinon.spy(Logger, 'showWarning');
      logWarningSpy = sinon.spy(Logger, 'logWarning');
    });
    afterEach(function () {
      showWarningSpy.restore();
      logWarningSpy.restore();
    });

    test('NoUpstreamBranchToCherryPickWarning', () => {
      Logger.showNoUpstreamBranchToCherryPickWarning('NAME');
      const expectedMessage = 'No upstream branch selected to cherry pick. Current branch is "NAME"';

      checkWarnings(expectedMessage);
    });

    test('NotCommitedMergeConflictSolvingWarning', () => {
      Logger.showNotCommitedMergeConflictSolvingWarning();
      const expectedMessage = 'Merge conflicts solving is not commited.';

      checkWarnings(expectedMessage);
    });

    test('NotSolvedMergeConflictWarning', () => {
      Logger.showNotSolvedMergeConflictWarning();
      const expectedMessage = 'Please, solve merge conflicts and commit the changes.';

      checkWarnings(expectedMessage);
    });

    test('MergeConflictDetectedWarning', () => {
      Logger.showMergeConflictDetectedWarning('NAME');
      const expectedMessage = `Merge conflict on branch "NAME" is detected. 
Please, solve it, commit and press "Continue cherry-pick" button.`;

      checkWarnings(expectedMessage);
    });

    test('SeveralSeparatorsWarning', () => {
      Logger.showSeveralSeparatorsWarning('a', 'b');
      const expectedMessage = 'Branch name includes several "__". Branch name: "a", upstream branch name: "b"';

      checkWarnings(expectedMessage);
    });
  });
});
