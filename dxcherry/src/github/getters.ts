import { OctokitResponse } from '@octokit/types';
import { GetResponseDataType, LabelsDataType, ReviewersDataType, BranchesDataType } from './types';
import { client } from './createClient';
import { REPO_DATA } from './config';

function getData(res: OctokitResponse<GetResponseDataType>): GetResponseDataType {
    return res.data;
};

async function getLabels(): Promise<LabelsDataType> {
    return getData(await client.issues.listLabelsForRepo(REPO_DATA)) as LabelsDataType;
};

async function getReviewers(): Promise<ReviewersDataType> {
    return getData(await client.repos.listCollaborators(REPO_DATA)) as ReviewersDataType;
};

async function getBranches(): Promise<BranchesDataType> {
    return getData(await client.repos.listBranches(REPO_DATA)) as BranchesDataType;
};

export {
    getLabels,
    getReviewers,
    getBranches
};
