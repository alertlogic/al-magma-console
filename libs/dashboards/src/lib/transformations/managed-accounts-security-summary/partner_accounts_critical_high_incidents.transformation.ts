import { getTotalForKeys } from '../transformation.utilities';

export const partnerAccountsCriticalHighIncidents = (response: {rows: any[];}) => {

  enum Column {
    AccountId,
    AccountName,
    AvgDays,
    Counts
  }

  const accountsWithCriticalHighIncidents = response.rows
    .filter(row => {
      const totalCriticalHighIncidents = getTotalForKeys(row[Column.Counts].incident, ['Critical', 'High']);
      return totalCriticalHighIncidents > 0;
    });

  return {
    primaryCount: accountsWithCriticalHighIncidents.length
  };
};
