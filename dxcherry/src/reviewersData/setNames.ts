import axios from 'axios';
import { REVIEWER_DATA } from '../github/config';
import { ReviewersDataType } from '../github/types';
interface Reviewer {
  l: string,
  f: string,
  gh: string,
}

export async function setNames (reviewers : ReviewersDataType): Promise<any> {
  const response = await axios(REVIEWER_DATA.url as string);
  const data = response.data as Array<Reviewer>;

  reviewers.forEach(reviewer => {
    const reviewerData = data.find(el => el.gh === reviewer.login);

    if (!reviewerData) {
      return;
    }

    reviewer.login = `${reviewerData.l} ${reviewerData.f} (${reviewer.login})`;
  });
}
