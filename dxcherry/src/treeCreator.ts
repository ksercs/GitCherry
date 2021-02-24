import { ExtendedTreeItem, REVIEWERS_ROOT_LABEL, LABELS_ROOT_LABEL, VERSION_ROOT_LABEL } from './treeItem';
import getReviewerPayload from './reviewersData/getReviewerPayload';
import GithubClient from './github/client';

const CHERRY_PICK_LABEL = 'cherry-pick';
const AUTOMATICALLY_ADDED_LABELS = [CHERRY_PICK_LABEL];

export default class TreeCreator {
  private static createTreeItem (rootLabel: string, data: Array<any>, nameKey: string = 'name', expanded: boolean = true): ExtendedTreeItem {
    const children = data ? [...data.map(item => TreeCreator.createTreeItem(item[nameKey], item.children, nameKey, item.expanded ?? expanded))] : undefined;
    return new ExtendedTreeItem(rootLabel, children, expanded);
  }

  private static async createLabelsTree (labels: any[], branches: any[]): Promise<ExtendedTreeItem> {
    return this.createTreeItem(LABELS_ROOT_LABEL, this.filterLabels(labels, branches));
  }

  private static async createReviewersTree (ignoreCache?: boolean): Promise<ExtendedTreeItem> {
    const reviewerPayload = await getReviewerPayload(ignoreCache);

    return this.createTreeItem(REVIEWERS_ROOT_LABEL, reviewerPayload, 'name', true);
  }

  private static async createBranchesTree (branches: any[]): Promise<ExtendedTreeItem> {
    return this.createTreeItem(VERSION_ROOT_LABEL, branches);
  }

  private static filterLabels (labels: Array<any>, branches: Array<any>): Array<any> {
    return labels.filter(label => {
      return !(AUTOMATICALLY_ADDED_LABELS.find(l => l === label.name) || branches.find(b => b.name === label.name));
    });
  }

  static async createTree (ignoreCache?: boolean): Promise<ExtendedTreeItem[]> {
    const branches = await GithubClient.getBranches();
    const labels = await GithubClient.getLabels();

    return [new ExtendedTreeItem('Pull request settings', [
      await TreeCreator.createBranchesTree(branches),
      await TreeCreator.createLabelsTree(labels, branches),
      await TreeCreator.createReviewersTree(ignoreCache)
    ], true)];
  }
}
