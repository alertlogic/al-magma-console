import { Widget as WidgetConfig } from '@al/ng-visualizations-components';

export const lastScannedCountChange = (responses: {rows: any[];}[], item?: WidgetConfig) => {

  enum Column {
    VulnCount,
    ExploitCount,
    ExternalCount,
    UnscannedHosts
  }
  const unscannedStart = responses[0].rows[0] ? responses[0].rows[0][Column.UnscannedHosts] : 0;
  const unscannedEnd = responses[1].rows[0] ? responses[1].rows[0][Column.UnscannedHosts] : 0;
  const changeAmount = unscannedEnd > 0 ? unscannedEnd - unscannedStart : 0;
  return {
    primaryCount: unscannedEnd,
    changeCount: changeAmount,
    changeType: changeAmount <= 0 ? "good" : "bad"
  };
};
