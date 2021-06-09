import { assert } from 'chai';
import { describe, test, before, after } from 'mocha';
import * as sinon from 'sinon';
import * as vs from 'vscode';

import Logger from '../../info/logger';

describe('common api', function () {
  let showErrorMessageSpy: sinon.SinonSpy<[message: string, options: vs.MessageOptions, ...items: vs.MessageItem[]], PromiseLike<vs.MessageItem | undefined>>;
  let logErrorSpy: sinon.SinonSpy<any[], any> | sinon.SinonSpy<unknown[], unknown>;

  before(function () {
    showErrorMessageSpy = sinon.spy(vs.window, 'showErrorMessage');
    logErrorSpy = sinon.spy(Logger, 'logError');
  });
  after(function () {
    showErrorMessageSpy.restore();
  });

  test('showError', () => {
    const message = 'my error';
    Logger.showError(message);

    assert(logErrorSpy.calledWith(message), 'error message was logged');
    assert(showErrorMessageSpy.calledWith(message), 'vs code showed an error message');
  });
});
