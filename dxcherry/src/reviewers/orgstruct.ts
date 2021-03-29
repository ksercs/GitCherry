import axios from 'axios';
import { authentication } from 'vscode';
import Logger from '../info/Logger';
import { ORGSTRUCT_AUTH_URL, SQUADS_SOURCE_URL } from './config';

async function getToken () : Promise<any> {
  const session = await authentication.getSession('microsoft', ['openid'], { createIfNone: true });

  Logger.logInfo(JSON.stringify(session.account));

  try {
    const response = await axios.post(ORGSTRUCT_AUTH_URL, {
      access_token: session.accessToken
    }, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      timeout: 30000
    });

    Logger.logInfo(`Token request finished with status ${response.status}`);
    return response.data;
  } catch (err) {
    Logger.logInfo(`Token request failed: ${err}`);
    Logger.msRefreshError();
  }
}

async function getSquadData () : Promise<any> {
  const token = await getToken();

  if (!token) {
    return {};
  }

  const response = await axios(SQUADS_SOURCE_URL, {
    headers: {
      cookie: `jwt=${token}`
    },
    timeout: 30000
  });

  Logger.logInfo(`Squad data request finished with status ${response.status}`);

  return response.data.data;
}

export {
  getSquadData
};
