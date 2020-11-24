import axios from 'axios';
import { REVIEWER_DATA } from '../github/config';

export async function setNames(githubNames : Array<any>): Promise<any> {
    const response = await axios(REVIEWER_DATA.url as string);
    const data = response.data;

    githubNames.forEach((githubName: any) => {
        const userData = data.find((el: any) => el.gh === githubName.login);

        if(!userData) {
            return;
        }

        githubName.login = `${userData.l} ${userData.f} (${githubName.login})`;
    });
}