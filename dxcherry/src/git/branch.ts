import { workspace } from 'vscode';
const branch = require('git-branch');

async function getBranchName () {
  return await branch(workspace.workspaceFolders?.[0].uri.fsPath);
};

export {
  getBranchName
};
