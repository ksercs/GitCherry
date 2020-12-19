import { PATH_TO_REPO } from '../github/config';
const branch = require('git-branch');

async function getBranchName () {
  return await branch(PATH_TO_REPO);
};

export {
  getBranchName
};
