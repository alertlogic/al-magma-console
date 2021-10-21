import { Widget as WidgetConfig, ZeroStateReason, ZeroState } from '@al/ng-visualizations-components';
import { SeverityCountSummaries } from '../kalm.named_query_response.types';
import { kalmDateStringToJSDate, getLocalShortDate } from '../transformation.utilities';

enum Column {
  Date,
  ThreatCountSummary
}

const severities = ['Info', 'Low', 'Medium', 'High', 'Critical'];

const generateSeries = (type: string, data: SeverityCountSummaries): any[] => {
  const rows = data.rows;
  return rows.map((item, idx) => {
    const startDT = kalmDateStringToJSDate(item[Column.Date] as string).getTime() / 1000;
    const endDT = kalmDateStringToJSDate(item[Column.Date] as string, 23, 59, 59, 999).getTime() / 1000;

    return {
      x: idx,
      y: item[1][type] as number || null,
      recordLink: {
        threat: type,
        startDate: startDT,
        endDate: endDT,
        source: 'WLA'
      }
    };
  });
};

const getClassNameForSeverity = (severity: string): string => {
  const sevPosition = severities.indexOf(severity);
  if(sevPosition === severities.length-1) {
    return severity;
  }
  if(sevPosition === 0) {
    return 'info2';
  }
  return severities[sevPosition-1];
};

export const wlaIncidentTrendSeverity = (response: any, item?: WidgetConfig) => {
    const rows = response.rows;
    if (rows.length === 0) {
      return {
        nodata: true,
        reason: ZeroStateReason.Zero,
      };
    }

    const dates: string[] = [];
    response.rows.forEach((row) => {
      const parsedDate: Date  = kalmDateStringToJSDate(row[Column.Date] as string);
      dates.push(getLocalShortDate(parsedDate));
    });

    const dataSeries = [];
    severities.map((sev) => {
      const data = generateSeries(sev, response);
      const total = data.reduce((acc, b) => acc + b.y, 0);
      if(total > 0) { // Prevent zero data series to appear on chart\in legend
        dataSeries.push({
          name: sev,
          data: data,
          className: getClassNameForSeverity(sev).toLowerCase(),
          type: 'area'
        });
      }
    });

    return {
      xAxis: {
        categories: dates
      },
      yAxis: {
        title: {
          text: 'Count of Incidents'
        }
      },
      series: dataSeries,
      legend: {
        reversed: true
      }
    };
};





