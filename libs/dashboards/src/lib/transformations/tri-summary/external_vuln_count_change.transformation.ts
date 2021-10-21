import { Widget as WidgetConfig } from '@al/ng-visualizations-components';

export const externalVulnCountChange = (responses: {rows: any[];}[], item?: WidgetConfig) => {

  enum Column {
    VulnCount,
    ExploitCount,
    ExternalCount,
    UnscannedHosts
  }
  const vulnCountStart = responses[0].rows[0] ? responses[0].rows[0][Column.ExternalCount] : 0;
  const vulnCountEnd = responses[1].rows[0] ? responses[1].rows[0][Column.ExternalCount] : 0;
  const changeAmount = vulnCountEnd > 0 ? vulnCountEnd - vulnCountStart : 0;
  return {
    primaryCount: vulnCountEnd,
    changeCount: changeAmount,
    changeType: changeAmount <= 0 ? "good" : "bad"
  };
};
