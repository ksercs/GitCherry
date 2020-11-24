import { ExtendedTreeItem, REVIEWERS_ROOT_LABEL, LABELS_ROOT_LABEL, VERSION_ROOT_LABEL } from './treeItem';
import { getLabels, getBranches, getReviewers } from './github/getters';

export class TreeCreator {
  private static createTreeItem(rootLabel: string, data: Array<any>, nameKey: string = 'name'): ExtendedTreeItem {
    return new ExtendedTreeItem(rootLabel, [
      ...data.map(item => new ExtendedTreeItem(item[nameKey]))
    ]);
  } 

  private static async createLabelsTree(): Promise<ExtendedTreeItem> {
    const labels = await getLabels();

    return this.createTreeItem(LABELS_ROOT_LABEL, labels);
  }

  private static async createReviewersTree(): Promise<ExtendedTreeItem> {
    const reviewers = await getReviewers();

    return this.createTreeItem(REVIEWERS_ROOT_LABEL, reviewers, 'login');
  }

  private static async createBranchesTree(): Promise<ExtendedTreeItem> {
    const branches = await getBranches();

    return this.createTreeItem(VERSION_ROOT_LABEL, branches);
  }

  static async createTree(): Promise<ExtendedTreeItem[]> {
    return [new ExtendedTreeItem('Pull request settings', [
      await TreeCreator.createBranchesTree(),
      await TreeCreator.createLabelsTree(),
      await TreeCreator.createReviewersTree(),
    ])];
  }
}
