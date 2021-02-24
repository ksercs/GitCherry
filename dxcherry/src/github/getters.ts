import { OctokitResponse } from '@octokit/types';
import { GetResponseDataType, LabelsDataType, ReviewersDataType, BranchesDataType, UserDataType } from './types';
import { getClient } from './createClient';
import Git from '../git/git';

function getData (res: OctokitResponse<GetResponseDataType>): GetResponseDataType {
  return res.data;
};

async function getLabels (): Promise<LabelsDataType> {
  return getData(await getClient().issues.listLabelsForRepo(Git.getRepoData())) as LabelsDataType;
};

async function getReviewers (): Promise<ReviewersDataType> {
  return getData(await getClient().repos.listCollaborators(Git.getRepoData())) as ReviewersDataType;
};

async function getBranches (): Promise<BranchesDataType> {
  return getData(await getClient().repos.listBranches(Git.getRepoData())) as BranchesDataType;
};

async function getUser (): Promise<UserDataType> {
  return getData(await getClient().users.getAuthenticated(Git.getRepoData())) as UserDataType;
};

export {
  getLabels,
  getReviewers,
  getBranches,
  getUser
};
