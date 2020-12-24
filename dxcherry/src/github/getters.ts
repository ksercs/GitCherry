import { OctokitResponse } from '@octokit/types';
import { GetResponseDataType, LabelsDataType, ReviewersDataType, BranchesDataType, UserDataType } from './types';
import { getClient } from './createClient';
import { REPO_DATA } from './config';

function getData (res: OctokitResponse<GetResponseDataType>): GetResponseDataType {
  return res.data;
};

async function getLabels (): Promise<LabelsDataType> {
  return getData(await getClient().issues.listLabelsForRepo(REPO_DATA)) as LabelsDataType;
};

async function getReviewers (): Promise<ReviewersDataType> {
  return getData(await getClient().repos.listCollaborators(REPO_DATA)) as ReviewersDataType;
};

async function getBranches (): Promise<BranchesDataType> {
  return getData(await getClient().repos.listBranches(REPO_DATA)) as BranchesDataType;
};

async function getUser (): Promise<UserDataType> {
  return getData(await getClient().users.getAuthenticated(REPO_DATA)) as UserDataType;
};

export {
  getLabels,
  getReviewers,
  getBranches,
  getUser
};
