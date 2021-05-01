import axios from 'axios';
import { REVIEWERS_URL } from './config';
import Storage, { REVIEWERS } from '../storage';
import Logger from '../info/logger';
import GithubClient from '../github/client';
import { Reviewer } from './reviewer';

const TECH_WRITER_ROLE = 'Technical Writer';

async function getAllUsers () : Promise<Reviewer[]> {
  const response = await axios(REVIEWERS_URL);
  return response.data as Reviewer[];
}

function getOwnerData (allUsers : Array<Reviewer>, ownerLogin : string) : Reviewer | undefined {
  const owner = allUsers.find(user => user.gh === ownerLogin);

  if (owner) {
    return owner;
  }

  Logger.showGithubLoginNotFoundError(ownerLogin);
}

function getUserSquad (user: Reviewer) : string {
  // all techwriters are in the one pseudosquad named by their role
  // if user has no squad - use pseudosquad 'Other'
  return (user.po === TECH_WRITER_ROLE ? user.po : user.sq) || 'Other';
}

function getUserTribe (user: Reviewer) : string {
  return user.t || user.tb || 'Other';
}

async function createReviewerPayload () : Promise<string[]> {
  const { login } = await GithubClient.getUser();
  const allUsers = await getAllUsers();
  const owner = getOwnerData(allUsers, login) as Reviewer;
  const ownerTribe = getUserTribe(owner);
  // owner's squad should be the first node
  const result: any[] = [{
    name: owner.sq,
    children: [],
    expanded: true
  }];
  // get users from tribe (except owner)
  const tribeUsers = allUsers.filter(user => getUserTribe(user) === ownerTribe && user.e !== owner.e);

  // create tribe tree (result -> squads -> members)
  tribeUsers.forEach(user => {
    const userSquad = getUserSquad(user);
    let squadData = result.find((e: any) => e.name === userSquad);

    if (!squadData) {
      squadData = {
        name: userSquad,
        children: [],
        expanded: false
      };

      result.push(squadData);
    }

    squadData.children.push({
      name: `${user.l} ${user.f} (${user.gh})`
    });
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
