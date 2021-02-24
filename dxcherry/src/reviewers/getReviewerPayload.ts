import axios from 'axios';
import { REVIEWER_DATA, USERS_DATA } from '../github/config';
import Storage, { REVIEWERS } from './storage';
import { authentication } from 'vscode';
import { logInfo } from '../info';
import { msRefreshError, ownerSquadNotFoundError } from '../info/errors/errors';
import { GithubLoginNotFoundError } from '../info/errors/githubLoginNotFoundError';
import GithubClient from '../github/client';

const TECH_WRITER_ROLE = 'Technical Writer';

interface Reviewer {
  l: string,
  f: string,
  gh: string,
  e: string,
  t: string
}

function getOwnerData (allUsers : Array<Reviewer>, ownerLogin : string) : Reviewer {
  const owner = allUsers.find(user => user.gh === ownerLogin);

  if (owner) {
    return owner;
  }

  throw new GithubLoginNotFoundError(ownerLogin);
}

async function getAllUsers () : Promise<Array<Reviewer>> {
  const response = await axios(REVIEWER_DATA.url);
  return response.data as Array<Reviewer>;
}

async function getToken () : Promise<any> {
  const session = await authentication.getSession('microsoft', ['openid'], { createIfNone: true });

  logInfo(JSON.stringify(session.account));

  try {
    const response = await axios.post('https://resolve.devexpress.com/authorize', {
      access_token: session.accessToken
    }, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      timeout: 30000
    });

    logInfo(`Token request finished with status ${response.status}`);
    return response.data;
  } catch (err) {
    logInfo(`Token request failed: ${err}`);
    throw msRefreshError;
  }
}

async function getSquadData () : Promise<any> {
  const token = await getToken();

  if (!token) {
    return {};
  }

  const response = await axios(USERS_DATA.url, {
    headers: {
      cookie: `jwt=${token}`
    },
    timeout: 30000
  });

  logInfo(`Squad data request finished with status ${response.status}`);

  return response.data.data;
}

function getOwnerSquad (users: any, orgUnits: any, owner: Reviewer) : string {
  const userKeys = Object.keys(users);
  const ownerKey = userKeys.find(key => users[key].email === owner.e);

  if (!ownerKey) {
    throw ownerSquadNotFoundError;
  }

  const ownerData = users[ownerKey];
  const squad = getSquad(ownerData, orgUnits);

  return squad.name;
}

export default async function getReviewerPayload (ignoreCache?: boolean) : Promise<any[]> {
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

function getSquad (userData: any, orgUnits: any) : any {
  if (userData.roles.includes(TECH_WRITER_ROLE)) {
    return {
      name: TECH_WRITER_ROLE
    };
  }

  const squadKey = userData.hierarchies.squad?.find((key: string) => !orgUnits[key].isDeleted);
  return orgUnits[squadKey];
}

async function createReviewerPayload () : Promise<any[]> {
  const { login } = await GithubClient.getUser();
  const allUsers = await getAllUsers();
  const owner = getOwnerData(allUsers, login);
  const result = [] as any[];

  const tribeUsers = allUsers.filter(user => user.t === owner.t);
  const { users, orgUnits } = await getSquadData();
  const userKeys = Object.keys(users);
  const ownerSquad = getOwnerSquad(users, orgUnits, owner);

  result.push({
    name: ownerSquad,
    children: [],
    expanded: true
  });

  tribeUsers.forEach(user => {
    if (user.gh === login) {
      return;
    }

    const userKey = userKeys.find(key => users[key].email === user.e);
    const userData = userKey && users[userKey];

    if (!userData) {
      return;
    }

    const squad = getSquad(userData, orgUnits);

    const squadName = squad?.name || 'Other';
    const squadData = result.find((e: any) => e.name === squadName);

    if (squadData) {
      squadData.children.push({
        name: `${user.l} ${user.f} (${user.gh})`
      });
    } else {
      result.push({
        name: squadName,
        children: [{
          name: `${user.l} ${user.f} (${user.gh})`
        }],
        expanded: false
      });
    }
  });

  return result;
}
