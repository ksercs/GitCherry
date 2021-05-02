import { ExtendedTreeItem, REVIEWERS_ROOT_LABEL, LABELS_ROOT_LABEL, UPSTREAM_ROOT_LABEL } from './item';
import { getReviewersPayload } from '../reviewers/payload';
import GithubClient from '../github/client';

const CHERRY_PICK_LABEL = 'cherry-pick';
const AUTOMATICALLY_ADDED_LABELS = [CHERRY_PICK_LABEL];

export default class TreeCreator {
  private static createTreeItem (rootLabel: string, data: any[], nameKey: string = 'name', expanded: boolean = true): ExtendedTreeItem {
    const children = data ? [...data.map(item => TreeCreator.createTreeItem(item[nameKey], item.children, nameKey, item.expanded ?? expanded))] : undefined;
    return new ExtendedTreeItem(rootLabel, children, expanded);
  }

  private static async createLabelsTree (labels: string[]): Promise<ExtendedTreeItem> {
    return this.createTreeItem(LABELS_ROOT_LABEL, labels);
  }

  private static async createReviewersTree (ignoreCache?: boolean): Promise<ExtendedTreeItem> {
    const reviewerPayload = await getReviewersPayload(ignoreCache);

    return this.createTreeItem(REVIEWERS_ROOT_LABEL, reviewerPayload, 'name', true);
  }

  private static async createBranchesTree (branches: string[]): Promise<ExtendedTreeItem> {
    return this.createTreeItem(UPSTREAM_ROOT_LABEL, branches);
  }

  static async createTree (ignoreCache?: boolean): Promise<ExtendedTreeItem[]> {
    const branches = await GithubClient.getBranches();
    const labels = await GithubClient.getLabels();

    return [new ExtendedTreeItem('Pull request settings', [
      await TreeCreator.createBranchesTree(branches),
      await TreeCreator.createLabelsTree(labels),
      await TreeCreator.createReviewersTree(ignoreCache)
    ], true)];
  }
}
