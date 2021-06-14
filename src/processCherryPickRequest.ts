import Git from './git/client';
import { TreePayload } from './tree/payload';
import Logger from './info/Logger';

async function processCherryPickRequest (payload: TreePayload) {
  Logger.logInfo('start cherry picking');
  Logger.logInfo(`prepared payload: ${JSON.stringify(arguments)}`);
  const branch = await Git.getBranchName();
  const upstreams = payload.upstreams;

  if (upstreams.length === 0) {
    Logger.showNoUpstreamBranchToCherryPickWarning(branch);
  } else {
    await Git.startCherryPicking(upstreams);
  }
};

export {
  processCherryPickRequest
};
