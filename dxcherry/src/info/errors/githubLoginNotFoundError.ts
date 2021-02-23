import { CustomError } from './customError';

class GithubLoginNotFoundError extends CustomError {
    constructor (login: string) { 
        super(`User github login was not found in database: ${login}`);
    }
};

export {
    GithubLoginNotFoundError
};