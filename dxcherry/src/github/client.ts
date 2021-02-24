import { Octokit } from '@octokit/rest';
import { OctokitResponse } from '@octokit/types';
import { authentication, AuthenticationSession } from 'vscode';
import { showInfo, logInfo } from '../info';
import { missingGithubTokenError } from '../info/errors/errors';
import { PullRequestCreatingError } from '../info/errors/pullRequestCreatingError';
import {
    GetResponseDataType,
    LabelsDataType, 
    ReviewersDataType, 
    BranchesDataType, 
    UserDataType, 
    PullRequestDataType, 
    RepoDataType
} from './types';
import Git from '../git/git';

function getData (res: OctokitResponse<GetResponseDataType>): GetResponseDataType {
    return res.data;
};

export default class GithubClient {
    
    private static octokit: Octokit;
    private static repoData: RepoDataType;

    private static async getSession(): Promise<AuthenticationSession> {
        const session = await authentication.getSession('github', ['user', 'repo'], { createIfNone: true });

        if (!session) {
            missingGithubTokenError.show();
            missingGithubTokenError.log();
        }

        return session;
    }
      
    static async init() {
        const session = await GithubClient.getSession();

        GithubClient.octokit = new Octokit({
            auth: session.accessToken
        });
        GithubClient.repoData = Git.getRepoData();

        showInfo(`You are logged in GitHub as ${session.account.label}`);
        logInfo(`Github login: ${session.account.label}`);
    }

    static async getLabels (): Promise<LabelsDataType> {
        return getData(await GithubClient.octokit.issues.listLabelsForRepo(GithubClient.repoData)) as LabelsDataType;
    }
    
    static async getReviewers (): Promise<ReviewersDataType> {
        return getData(await GithubClient.octokit.repos.listCollaborators(GithubClient.repoData)) as ReviewersDataType;
    }
    
    static async getBranches (): Promise<BranchesDataType> {
        return getData(await GithubClient.octokit.repos.listBranches(GithubClient.repoData)) as BranchesDataType;
    }
    
    static async getUser (): Promise<UserDataType> {
        return getData(await GithubClient.octokit.users.getAuthenticated(GithubClient.repoData)) as UserDataType;
    }

    static async setLabels (issueNumber: number, labels: string[]) {
        await GithubClient.octokit.issues.setLabels(Object.assign({}, GithubClient.repoData, { issue_number: issueNumber, labels }));
    };
    
    static async addAssign (issueNumber: number, assignees: string[]) {
        await GithubClient.octokit.issues.addAssignees(Object.assign({}, GithubClient.repoData, { issue_number: issueNumber, assignees }));
    };
    
    static async addReviewers (pullNumber: number, reviewers: string[]) {
        await GithubClient.octokit.pulls.requestReviewers(Object.assign({}, GithubClient.repoData, { pull_number: pullNumber, reviewers }));
    };

    static async createPullRequest(login: string, branch: string, version: string, title: string, body: string): Promise<OctokitResponse<PullRequestDataType>|undefined> {
        const payload = Object.assign(
            {},
            GithubClient.repoData, 
            {
                base: version,
                head: `${login}:${branch}_${version}`,
                title,
                body
            }
        );
        logInfo(`Pull request creating payload: ${JSON.stringify(payload)}`);

        try {
            const response = await GithubClient.octokit.pulls.create(payload);
        
            logInfo('Pull request is created');
            showInfo(`Pull request from ${payload.head} to ${version} was successfully created`);

            return response;
        } catch(e) {
            logInfo(e);
            const creatingError = new PullRequestCreatingError(payload.head, version);
            creatingError.show();
        }
    }
};