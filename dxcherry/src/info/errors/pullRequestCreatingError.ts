import { CustomError } from './customError';

class PullRequestCreatingError extends CustomError {
    constructor (head: string, version: string) { 
        super(`Pull request from ${head} to ${version} was not created. 
            Check that ${head} was pushed to the fork`);
    }
};

export {
    PullRequestCreatingError
};