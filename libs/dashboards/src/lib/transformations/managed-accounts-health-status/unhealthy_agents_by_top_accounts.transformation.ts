import { countByTopAccounts } from '../transformation.utilities';

export const unhealthyAgentsByTopAccounts = (response: {rows: any[];}) => {
  return countByTopAccounts(response.rows, 'agent_status.Unhealthy', 'Unhealthy Agents');
};
