import axios from 'axios';
import { REVIEWERS_URL } from './config';
import Storage, { REVIEWERS } from '../storage';
import { ownerSquadNotFoundError } from '../info/errors/errors';
import { GithubLoginNotFoundError } from '../info/errors/githubLoginNotFoundError';
import GithubClient from '../github/client';
import { Reviewer } from './reviewer';
import { getSquadData } from './orgstruct';

const TECH_WRITER_ROLE = 'Technical Writer';

async function getAllUsers () : Promise<Reviewer[]> {
  const response = await axios(REVIEWERS_URL);
  return response.data as Reviewer[];
}

function getOwnerData (allUsers : Array<Reviewer>, ownerLogin : string) : Reviewer {
  const owner = allUsers.find(user => user.gh === ownerLogin);

  if (owner) {
    return owner;
  }

  throw new GithubLoginNotFoundError(ownerLogin);
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

function getSquad (userData: any, orgUnits: any) : any {
  if (userData.roles.includes(TECH_WRITER_ROLE)) {
    return {
      name: TECH_WRITER_ROLE
    };
  }

  const squadKey = userData.hierarchies.squad?.find((key: string) => !orgUnits[key].isDeleted);
  return orgUnits[squadKey];
}

async function createReviewerPayload () : Promise<string[]> {
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
