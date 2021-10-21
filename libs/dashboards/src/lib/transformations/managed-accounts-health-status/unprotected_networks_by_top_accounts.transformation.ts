import { countByTopAccounts } from '../transformation.utilities';

export const unprotectedNetworksByTopAccounts = (response: {rows: any[];}) => {
  return countByTopAccounts(response.rows, 'network_status.Unhealthy', 'UnProtected Networks');
};
