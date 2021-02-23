import { Octokit } from '@octokit/rest';
import { GetResponseDataTypeFromEndpointMethod } from '@octokit/types';

type LabelsDataType = GetResponseDataTypeFromEndpointMethod<
  typeof Octokit.prototype.issues.listLabelsForRepo
>;

type ReviewersDataType = GetResponseDataTypeFromEndpointMethod<
  typeof Octokit.prototype.repos.listCollaborators
>;

type BranchesDataType = GetResponseDataTypeFromEndpointMethod<
  typeof Octokit.prototype.repos.listBranches
>;

type UserDataType = GetResponseDataTypeFromEndpointMethod<
  typeof Octokit.prototype.users.getAuthenticated
>;

type GetResponseDataType = LabelsDataType | ReviewersDataType | BranchesDataType | UserDataType;

export {
  LabelsDataType,
  ReviewersDataType,
  BranchesDataType,
  GetResponseDataType,
  UserDataType
};
