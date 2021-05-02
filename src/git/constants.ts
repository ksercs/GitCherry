const GITHUB_HTTPS_URL_REGEX = 'https://github.com/([A-Za-z0-9-]*)/([A-Za-z0-9-]*)';
const GITHUB_SSH_URL_REGEX = 'git@github.com:([A-Za-z0-9-]*)/([A-Za-z0-9-]*).git';
const BRANCH_REGEX: RegExp = /^(.+)__(.+)$/;

export {
  GITHUB_HTTPS_URL_REGEX,
  GITHUB_SSH_URL_REGEX,
  BRANCH_REGEX
};
