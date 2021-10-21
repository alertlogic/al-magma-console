import { countByTopAccounts } from '../transformation.utilities';

export const securityRemediationsByTopAccounts = (response: {rows: any[];}) => {
  return countByTopAccounts(response.rows, 'remediation', 'Count of Remediations');
};
