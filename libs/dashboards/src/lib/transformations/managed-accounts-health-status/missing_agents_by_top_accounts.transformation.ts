import { countByTopAccounts } from '../transformation.utilities';

export const missingAgentsByTopAccounts = (response: {rows: any[];}) => {
  return countByTopAccounts(response.rows, 'missing_agent.Missing', 'Missing Agents');
};

