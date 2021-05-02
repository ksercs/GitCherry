import Git from './git/client';
import { TreePayload } from './tree/payload';
import Logger from './info/logger';

async function processCherryPickRequest (payload: TreePayload) {
  Logger.logInfo('start cherry picking');
  Logger.logInfo(`prepared payload: ${JSON.stringify(arguments)}`);
  const branch = await Git.getBranchName();

  const [localBranch, baseUpstreamBranch] = Git.parseBranch(branch);
  Git.setBranches(localBranch, baseUpstreamBranch);
  const upstreams = payload.upstreams.filter((upstream) => upstream !== baseUpstreamBranch);

  Logger.logInfo(`branch: ${branch}, localBranch: ${localBranch}, baseUpstreamBranch: ${baseUpstreamBranch}, upstreams: ${upstreams}`);

  if (upstreams.length === 0) {
    Logger.showNoUpstreamBranchToCherryPickWarning(branch);
  } else {
    await Git.startCherryPicking(upstreams);
  }
};

export {
  processCherryPickRequest
};
