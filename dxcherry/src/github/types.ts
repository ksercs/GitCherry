import { GetResponseDataTypeFromEndpointMethod } from '@octokit/types';
import { client } from './createClient';

type LabelsDataType = GetResponseDataTypeFromEndpointMethod<
  typeof client.issues.listLabelsForRepo
>;

type ReviewersDataType = GetResponseDataTypeFromEndpointMethod<
  typeof client.repos.listCollaborators
>;

type BranchesDataType = GetResponseDataTypeFromEndpointMethod<
  typeof client.repos.listBranches
>;

type GetResponseDataType = LabelsDataType | ReviewersDataType | BranchesDataType;

export {
    LabelsDataType,
    ReviewersDataType,
    BranchesDataType,
    GetResponseDataType
}