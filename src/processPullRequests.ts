import Git from './git/client';
import { createPullRequest } from './github/createPullRequest';
import { TreePayload } from './tree/payload';
import Logger from './info/Logger';

async function pushAndCreatePullRequests (payload: TreePayload) {
  Logger.logInfo('start pull requests creating');
  Logger.logInfo(`prepared payload: ${JSON.stringify(payload)}`);
  const branch = await Git.getBranchName();
  const [localBranch, baseUpstreamBranch] = Git.parseBranch(branch);
  const upstreams = payload.upstreams;

  Logger.logInfo(`branch: ${branch}, localBranch: ${localBranch}, baseUpstreamBranch: ${baseUpstreamBranch}, upstreams: ${upstreams}`);

  for (let i = 0; i < upstreams.length; ++i) {
    const upstreamBranch = upstreams[i];
    const toBranch = `${localBranch}__${upstreamBranch}`;

    try {
      await Git.checkOut(toBranch);
      await Git.push();
      await createPullRequest(payload, upstreamBranch);
    } catch (e) {
      Logger.logError(e);
      if (e.message.includes('did not match any file')) {
        Logger.showNoLocalBranchError(toBranch);
      }
    }
  };

  await Git.checkoutBack();
};

export {
  pushAndCreatePullRequests
};
