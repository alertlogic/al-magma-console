import { ZeroStateReason } from '@al/ng-visualizations-components';

enum Column {
  Messages_Count = 1,
  Observations_Count,
  Incidents_Count
}

export const firewallLogVolume = (response: {rows: any[];}) => {
  const rowCount: number = response.rows.length;
  if (rowCount === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero
    };
  }

  const messages: number = response.rows[rowCount -1][Column.Messages_Count];
  const observations: number = response.rows[rowCount -1][Column.Observations_Count];
  const incidents: number = response.rows[rowCount -1][Column.Incidents_Count];
  if (messages + observations + incidents === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero
    };
  }
  const data = [];

  data.push({
    name: "Messages",
    y: 70,
    value: messages,
    className: "al-gray-500"
  });
  if(observations > 0) {
    data.push({
      name: "Observations",
      y: 20,
      value: observations,
      className: "al-blue-500"
    });
  }
  if(incidents > 0) {
    data.push({
      name: "Incidents",
      y: 10,
      value: incidents,
      className: "al-purple-500"
    });
  }
  if(data.length === 2) {
    data[1].y = 30;
  }

  return {
    series: [{
      data,
      name: 'Firewall Log Volume',
      showInLegend: true
    }]
  };
};
