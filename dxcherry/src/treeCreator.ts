import { ExtendedTreeItem, REVIEWERS_ROOT_LABEL, LABELS_ROOT_LABEL, VERSION_ROOT_LABEL } from './treeItem';

export class TreeCreator {
  // get children from server instead of hardcode values
  static createReviewersTree(): ExtendedTreeItem {
    return new ExtendedTreeItem(REVIEWERS_ROOT_LABEL, [
      new ExtendedTreeItem('ksercs'),
      new ExtendedTreeItem('jtoming830')
    ]);
  }

  // get children from server instead of hardcode values
  static createLabelsTree(): ExtendedTreeItem {
    return new ExtendedTreeItem(LABELS_ROOT_LABEL, [
      new ExtendedTreeItem('bug'),
      new ExtendedTreeItem('wontfix'),
      new ExtendedTreeItem('invalid'),
      new ExtendedTreeItem('question'),
      new ExtendedTreeItem('duplicate')
    ]);
  }

  // get children from server instead of hardcode values
  static createVersionsTree(): ExtendedTreeItem {
    return new ExtendedTreeItem(VERSION_ROOT_LABEL, [
      new ExtendedTreeItem('21_1'),
      new ExtendedTreeItem('20_2'),
      new ExtendedTreeItem('20_1'),
      new ExtendedTreeItem('19_2'),
      new ExtendedTreeItem('19_1'),
    ]);
  }
}
