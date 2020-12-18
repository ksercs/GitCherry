import axios from 'axios';
import { REVIEWER_DATA, USERS_DATA } from '../github/config';
import { getUser } from '../github/getters';
import Storage, { REVIEWERS } from '../storage';

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

  throw new Error(`user github login was not found in database: ${ownerLogin}`);
}

async function getAllUsers () : Promise<Array<Reviewer>> {
  const response = await axios(REVIEWER_DATA.url);
  return response.data as Array<Reviewer>;
}

async function getSquadData () : Promise<any> {
  const response = await axios(USERS_DATA.url, {
    headers: {
      cookie: `jwt=${USERS_DATA.jwt}`
    }
  });

  return response.data.data;
}

function getOwnerSquad (users: any, orgUnits: any, owner: Reviewer) : string {
  const userKeys = Object.keys(users);
  const ownerKey = userKeys.find(key => users[key].email === owner.e);

  if (!ownerKey) {
    throw new Error('owner squad was not defined');
  }

  const ownerData = users[ownerKey];
  const squadKey = ownerData.hierarchies.squad?.[0];

  return orgUnits[squadKey].name;
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

async function createReviewerPayload () : Promise<any[]> {
  const { login } = await getUser();
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

    const squadKey = userData.hierarchies.squad?.[0];
    const squad = orgUnits[squadKey]?.name || 'Other';
    const squadData = result.find((e: any) => e.name === squad);

    if (squadData) {
      squadData.children.push({
        name: `${user.l} ${user.f} (${user.gh})`
      });
    } else {
      result.push({
        name: squad,
        children: [{
          name: `${user.l} ${user.f} (${user.gh})`
        }],
        expanded: false
      });
    }
  });

  return result;
}
