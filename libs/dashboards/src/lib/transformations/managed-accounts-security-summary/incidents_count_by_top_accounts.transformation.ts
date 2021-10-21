import { countByTopAccounts } from '../transformation.utilities';

export const incidentCountByTopAccounts = (response: {rows: any[];}) => {
  return countByTopAccounts(response.rows, 'incident', 'Count of Incidents');
};
