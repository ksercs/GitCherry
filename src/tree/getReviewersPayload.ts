import Storage, { REVIEWERS } from '../storage';
import GithubClient from '../github/client';

async function createReviewerPayload () : Promise<string[]> {
  const { login } = await GithubClient.getUser();
  let reviewers = await GithubClient.getReviewers();
  reviewers = reviewers.filter((reviewer: { login: string }) => reviewer.login !== login);

  for (let i = 0; i < reviewers.length; ++i) {
    const login = reviewers[i].login;
    const name = await GithubClient.getContributorName(login);
    if (name) {
      reviewers[i].login = `${name} (${login})`;
    }
  }
  return reviewers.sort(({ login: a }: {login: string}, { login: b }: {login: string}) => {
    return a.localeCompare(b);
  });
}

async function getReviewersPayload (ignoreCache?: boolean) : Promise<string[]> {
  const storage = Storage.getStorage();
  let result;

  if (!ignoreCache) {
    result = storage.get(REVIEWERS) as any[];
  }

  if (!result) {
    result = await createReviewerPayload();
    storage.update(REVIEWERS, result);
  }

  return result;
}

export {
  getReviewersPayload
};
