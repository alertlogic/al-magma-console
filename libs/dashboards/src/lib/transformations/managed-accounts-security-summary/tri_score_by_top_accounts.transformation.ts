import { countByTopAccounts } from '../transformation.utilities';

export const triScoreByTopAccounts = (response: {rows: any[];}) => {
  return countByTopAccounts(response.rows, 'tri.Score', 'TRI Score', true);
};
