import { Memento } from 'vscode';

export const REVIEWERS = 'reviewers';

export default class Storage {
  private static storage: Memento;

  public static setStorage (_storage: Memento) {
    Storage.storage = _storage;
  }

  public static getStorage (): Memento {
    return Storage.storage;
  }
}
