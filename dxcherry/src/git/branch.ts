const branch = require('git-branch');
import { PATH_TO_REPO } from '../github/config';

async function getBranchName() {
    return await branch(PATH_TO_REPO);
};

export {
    getBranchName
}