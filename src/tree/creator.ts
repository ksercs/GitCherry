import { ExtendedTreeItem, REVIEWERS_ROOT_LABEL, LABELS_ROOT_LABEL, UPSTREAM_ROOT_LABEL } from './item';
import GithubClient from '../github/client';
import { getReviewersPayload } from './getReviewersPayload';

const LABELS_TO_SKIP: string[] = [];
const BRANCHES_TO_SKIP: string[] = [];

export default class TreeCreator {
  private static createTreeItem (rootLabel: string, data: any[], nameKey: string = 'name', expanded: boolean = true): ExtendedTreeItem {
    const children = data ? [...data.map(item => TreeCreator.createTreeItem(item[nameKey], item.children, nameKey, item.expanded ?? expanded))] : undefined;
    return new ExtendedTreeItem(rootLabel, children, expanded);
  }

  private static async createLabelsTree (labels: string[]): Promise<ExtendedTreeItem> {
    return this.createTreeItem(LABELS_ROOT_LABEL, labels);
  }

  private static async createReviewersTree (reviewers: string[]): Promise<ExtendedTreeItem> {
    return this.createTreeItem(REVIEWERS_ROOT_LABEL, reviewers, 'login');
  }

  private static async createBranchesTree (branches: string[]): Promise<ExtendedTreeItem> {
    return this.createTreeItem(UPSTREAM_ROOT_LABEL, branches);
  }

  static async createTree (ignoreCache?: boolean): Promise<ExtendedTreeItem[]> {
    const branches = (await GithubClient.getBranches()).filter(({ name }: {name: string}) => {
      return BRANCHES_TO_SKIP.indexOf(name) === -1;
    }); ;
    const labels = (await GithubClient.getLabels()).filter(({ name }: {name: string}) => {
      return LABELS_TO_SKIP.indexOf(name) === -1;
    });
    const reviewers = await getReviewersPayload(ignoreCache);

    return [new ExtendedTreeItem('Pull request settings', [
      await TreeCreator.createBranchesTree(branches),
      await TreeCreator.createLabelsTree(labels),
      await TreeCreator.createReviewersTree(reviewers)
    ], true)];
  }
}
