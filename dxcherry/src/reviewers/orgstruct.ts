import axios from 'axios';
import { authentication } from 'vscode';
import { logInfo } from '../info';
import { USERS_DATA } from './config';
import { msRefreshError } from '../info/errors/errors';

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

export {
  getSquadData
};
