import { ThreatLevelCountSummary } from './kalm.named_query_response.types';
import { AccountCount } from '../dashboards.types';
import { ZeroStateReason } from '@al/ng-visualizations-components';

enum Column {
  AccountId,
  AccountName,
  AvgDays,
  Counts
}
/*
  Utility function that takes string input in camelCase and return as words separated by spaces
  For example 'camelCase' becomes 'Camel Case'
*/
export const camelCaseToWords = (camelCase: string): string => camelCase
  .replace(/([A-Z])/g, (match) => ` ${match}`)
  .replace(/^./, (match) => match.toUpperCase());


/*
  Takes a kalm formatted date string in YYYY-MM-DD format and returns as a native JS local date representation defaulted to beginning of day - 00:00:00:000
  Time parts can be optionally set via additional arguments after the date argument
*/
export const kalmDateStringToJSDate = (date: string, hours: number = 0, minutes: number = 0, seconds: number = 0, milliseconds: number = 0): Date => {
  const dateParts = (date).split('-');
    const year = Number(dateParts[0]);
    const monthNumber = Number(dateParts[1])-1; // zero based
    const dayNumber = Number(dateParts[2]);
    return new Date(Date.UTC(year, monthNumber, dayNumber, hours, minutes, seconds, milliseconds));
};

export const getTotalForKeys = (counts: {[key: string]: number}|ThreatLevelCountSummary, keys?: string[]): number =>  {
  const actionKeys: string[] = keys ? [...keys] : Object.keys(counts);
  return actionKeys.reduce((a: number, b: any) => a + (counts[b] || 0), 0);
};

export const highlightSeverity = (severityCounts: ThreatLevelCountSummary, useCriticalScaling: boolean = false): string => {
  if(useCriticalScaling) {
    if(severityCounts.Critical > 0) {
      return 'highlight risk-critical';
    }
    if(severityCounts.High > 0) {
      return 'highlight risk-high';
    }
    if(severityCounts.Medium > 0) {
      return 'highlight risk-medium';
    }
  } else {
    if(severityCounts.Critical > 0) {
      return 'highlight critical';
    }
    if(severityCounts.High > 0) {
      return 'highlight high';
    }
    if(severityCounts.Medium > 0) {
      return 'highlight medium';
    }
  }

  return '';
};

export const highlightValue = (value: number, thresholds: {high?: number, medium?: number, low?: number, acceptable?: number}, reverseOrder: boolean = false) => {
  if(reverseOrder) { // used for when higher values typically treated as good indications
    if(value >= thresholds.acceptable) {
      return 'highlight acceptable';
    }
    if(value >= thresholds.low) {
      return 'highlight low';
    }
    if(value >= thresholds.medium) {
      return 'highlight medium';
    }
    if(value >= thresholds.high) {
      return 'highlight high';
    }
  }
  if(value >= thresholds.high) {
    return 'highlight high';
  }
  if(value >= thresholds.medium) {
    return 'highlight medium';
  }
  if(value >= thresholds.low) {
    return 'highlight low';
  }
  if(value >= thresholds.acceptable) {
    return 'highlight acceptable';
  }
  return 'highlight acceptable';
};

export const highlightRiskLevel = (value: number) => {
  switch (value) {
    case 1:
      return 'highlight risk-low';
    case 2:
        return 'highlight risk-medium';
    case 3:
        return 'highlight risk-high';
    case 4:
        return 'highlight risk-critical';
    default:
      return '';
  }
};

export const filterTopAccountCountRecords = (accountCounts: AccountCount[], limit: number = 10): AccountCount[] => {
  return accountCounts.sort((a, b) => {
    return b.count - a.count;
  })
  .slice(0, limit)
  .filter(row => {
    return row.count > 0;
  });
};

/*
 * Simple method to extract a value from any object through a dot notated path
 * Note: Wil not work with complex objects such as those containing functions, dates objects etc
 *
 * e.g. for an object of { tri: { Severity: 1, Count: 4 } }
 * and a path of "tri.Severity"
 *
 * it will return 4
 */
export const extractObjectValueByPath =  (obj: any, path: string, defaultValue: any = null) => {
  // Would mutate the original object so deep copy it
  let objCp = JSON.parse(JSON.stringify(obj));

  try {
    return path.split(".").map(field => objCp = objCp[field]).pop();
  } catch {
    return defaultValue;
  }
};

/*
 *
 */
export const countByTopAccounts = (rows: any[], countFieldName: string, chartDescription: string, ignoreTotalsInTooltip: boolean = false) => {

  const isNestedFieldLookup = countFieldName.includes('.');
  let responseRows = rows
    .map(row => {
      const accountCount = isNestedFieldLookup
        ? extractObjectValueByPath(row[Column.Counts], countFieldName)
        : getTotalForKeys(row[Column.Counts][countFieldName]);
      return {
        accountId: row[Column.AccountId],
        accountName: row[Column.AccountName],
        count: accountCount
      } as AccountCount;
    });
  responseRows = filterTopAccountCountRecords(responseRows);

  const totalForAllAccounts: number = responseRows.reduce((a, b) => a + b.count, 0);
  const accountNames: string[] = responseRows.map((row) => row.accountName);
  const seriesData = responseRows.map((row) => {
    return {y: row.count, recordLink: {aaid: `${row.accountId}`}, className: 'al-blue-400'};
  });

  if (seriesData.length === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero,
    };
  }

  return {
    dateOptions: accountNames,
    description: chartDescription,
    inverted: true,
    yAxisType: "linear",
    tooltipString: ignoreTotalsInTooltip
      ? '{{name}}: {{value}}'
      : `{{name}}: {{value}} {{newline}} Total: ${totalForAllAccounts} {{newline}} % of Total: {{%total[${totalForAllAccounts}]}}%`,
    series: [{
      type: 'column',
      data: seriesData,
      showInLegend: false
    }]
  };
};

/**
 * Returns the local date with month = short and day = 2-digits format
 * IMPORTANT: Use Date object native from JS in order to make UT valuable
 * @param date - a Date object previously processed from UTC
 */
export const getLocalShortDate = (parsedDate:Date): string => {
  parsedDate.setTime( parsedDate.getTime() + parsedDate.getTimezoneOffset()*60*1000 );
  return parsedDate.toLocaleDateString([], {day: '2-digit', month:'short'});
};

export const capitalizeFirstLetter = (name:string): string => {
  return name.charAt(0).toUpperCase() + name.slice(1);
};
