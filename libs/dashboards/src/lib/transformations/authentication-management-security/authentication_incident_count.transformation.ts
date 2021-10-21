import { isAuthenticationIncident } from '../../dashboards.types';

/**
 * incidentLogCount transformation
 * total incident count filtered by source = LOG
 * just count authentication incidents: 'admin:activity' and 'authentication:activity'
 * @param response - Raw data from API
 */
export const authenticationIncidentCount = (response: any): any => {
  const data = JSON.parse(JSON.stringify(response.aggregations.createtime_str.date_period['incident.attackClassId_str']));
  const reducer = (accumulator: number, currentValue: number): number => accumulator + currentValue;
  const authenticationIncidents: number[] = Object.keys(data).filter(item => isAuthenticationIncident(item)).map(item => data[item]);
  const primaryCount = response.total === 0 || authenticationIncidents.length === 0 ? 0 : authenticationIncidents.reduce(reducer);

  return {
    primaryCount
  };

};
