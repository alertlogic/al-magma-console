import { countByTopAccounts } from '../transformation.utilities';

export const unhealthyAppliancesByTopAccounts = (response: {rows: any[];}) => {
  return countByTopAccounts(response.rows, 'appliance_status.Unhealthy', 'Unhealthy Appliances');
};
