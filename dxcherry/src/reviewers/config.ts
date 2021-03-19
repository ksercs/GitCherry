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

['REVIEWERS_URL', 'ORGSTRUCT_AUTH_URL', 'SQUADS_SOURCE_URL'].forEach(v => {
  throwIfNot(process.env, v);
});

const REVIEWERS_URL = process.env.REVIEWERS_URL as string;

const ORGSTRUCT_AUTH_URL = process.env.ORGSTRUCT_AUTH_URL as string;
const SQUADS_SOURCE_URL = process.env.SQUADS_SOURCE_URL as string;

export {
  REVIEWERS_URL,
  ORGSTRUCT_AUTH_URL,
  SQUADS_SOURCE_URL
};
