import { Octokit } from "@octokit/rest";
import { GITHUB_USER } from './config';

const octokit = new Octokit(GITHUB_USER);

export {
    octokit as client 
};
