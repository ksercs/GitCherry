import { window } from 'vscode';
import log from '../log';

class CustomError extends Error {
    msg: string;

    constructor (msg: string) {
      super(msg);

      this.msg = msg;
    }

    show () {
      window.showErrorMessage(this.msg);
    }

    log () {
      log.appendLine(this.msg);
    }
};

export {
  CustomError
};
