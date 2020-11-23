import { TreeDataProvider } from './treeDataProvider';
import { Payload } from './payload';

export function payloadGetter(treeDataProvider: TreeDataProvider): Payload {
    return {
        title: '',
        description: '',
        versions: treeDataProvider.getSelectedVersions(),
        reviewers: treeDataProvider.getSelectedReviewers(),
        labels: treeDataProvider.getSelectedLabels()
    };
}
