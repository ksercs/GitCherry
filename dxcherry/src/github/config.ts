import { config as configDotenv } from 'dotenv';
import { resolve } from 'path';

configDotenv({
  path: resolve(__dirname, '../../.env')
});

const throwIfNot = <T, K extends keyof T>(obj: Partial<T>, prop: K): T[K] => {
  if (!obj[prop]) {
    throw new Error(`Environment is missing variable ${prop}`);
  } else {
    return obj[prop] as T[K];
  }
};

['USERS_SOURCE', 'REVIEWERS_SOURCE'].forEach(v => {
  throwIfNot(process.env, v);
});

export const GITHUB_USER = {
  userAgent: process.env.USER_AGENT as string
};

export const REPO_DATA = {
  repo: '',
  owner: ''
};

export function setRepoData (owner: string, repo: string) {
  REPO_DATA.owner = owner;
  REPO_DATA.repo = repo;
}

export const REVIEWER_DATA = {
  url: process.env.REVIEWERS_SOURCE as string
};

export const USERS_DATA = {
  url: process.env.USERS_SOURCE as string,
  jwt: process.env.USER_TOKEN as string
};
