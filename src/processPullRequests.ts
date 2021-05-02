import Git from './git/client';
import { createPullRequest } from './github/createPullRequest';
import { TreePayload } from './tree/payload';
import Logger from './info/logger';

async function pushAndCreatePullRequests (payload: TreePayload) {
  Logger.logInfo('start pull requests creating');
  Logger.logInfo(`prepared payload: ${JSON.stringify(payload)}`);
  const branch = await Git.getBranchName();
  const [localBranch, baseUpstreamBranch] = Git.parseBranch(branch);
  const upstreams = payload.upstreams;

  Logger.logInfo(`branch: ${branch}, localBranch: ${localBranch}, baseUpstreamBranch: ${baseUpstreamBranch}, upstreams: ${upstreams}`);

  for (let i = 0; i < upstreams.length; ++i) {
    const upstreamBranch = upstreams[i];

    try {
      await Git.checkOut(localBranch, upstreamBranch);
      await Git.push();
      await createPullRequest(payload, baseUpstreamBranch);
    } catch (e) {
      Logger.logError(e);
      if (e.message.includes('did not match any file')) {
        Logger.showError(`Branch "${localBranch}__${upstreamBranch}" does not exist. Did you forget to cherry-pick?`);
      }
    }
  };

  await Git.checkoutBack();
};

export {
  pushAndCreatePullRequests
};
