import { CustomError } from './customError';

const repoNotFoundError = new CustomError(`Repository is not found.
  Check that a git repository is opened.`);

const missingGithubTokenError = new CustomError('Missing Github token');

const missingOctokitClientError = new CustomError('Missing octokit client');

const msRefreshError = new CustomError(`Something went wrong during refresh.
  Check you signed in MS corporate account`);

const ownerSquadNotFoundError = new CustomError('Owner squad is not found');

const noLastCommitError = new CustomError(`No last commit found.
  Check that a git repository is opened`);

export {
  repoNotFoundError,
  missingGithubTokenError,
  missingOctokitClientError,
  msRefreshError,
  ownerSquadNotFoundError,
  noLastCommitError
};
