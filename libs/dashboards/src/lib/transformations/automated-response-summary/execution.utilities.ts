import { AlResponderAggregationsSummaryItem } from "@al/responder";
import { BaseColumnConfigSeries, BaseLineConfigSerie } from "../base_objects.transformation";

// get last date item and remove if its on the current day
const processLastDateItem = (datesSorted: string[]) => {
  const lastDateItem = new Date(parseInt(datesSorted[datesSorted.length - 1], 10) * 1000);
  const currentDT = new Date();
  if (lastDateItem.getFullYear() === currentDT.getFullYear()
    && lastDateItem.getMonth() === currentDT.getMonth()
    && lastDateItem.getDate() === currentDT.getDate()) {
    datesSorted.pop();
  }
};

export const createExecutionSerieEmptyArray = (length: number): BaseLineConfigSerie[] => {
  const serie: BaseLineConfigSerie[] = [];
  for (let i = 0; i < length; i++) {
    serie[i] = {
      x: i,
      y: 0,
      percentage: 0
    };
  }
  return serie;
};

export const getExecutionEndDate = (timestamp: string): number => {
  const date = new Date(parseInt(timestamp, 10) * 1000);
  date.setUTCHours(23);
  date.setUTCMinutes(59);
  date.setUTCSeconds(59);
  date.setUTCMilliseconds(999);
  return Math.round(date.getTime() / 1000);
};

export const complementeDateRecordLink = (
  serie: BaseLineConfigSerie[],
  dates: string[],
  recordLink: { [key: string]: string | number }) => {

  // complement record link
  for (let i = 0; i < serie.length; i++) {
    const startDate: string = dates[i];
    const endDate: number = getExecutionEndDate(dates[i]);
    serie[i].recordLink = {
      startDate,
      endDate,
      ...recordLink
    };
  }
};

export const generateExecutionSeriesByItem = (
  dictionaryPerDay: { [key: string]: number },
  dates: string[],
  data: AlResponderAggregationsSummaryItem[],
  recordLink: { [key: string]: string | number }):
  BaseLineConfigSerie[] => {
    processLastDateItem(dates);
  // an array with x element all with 0
  const serie = createExecutionSerieEmptyArray(dates.length);
  complementeDateRecordLink(serie, dates, recordLink);

  // fill the value properly
  data.forEach((item) => {
    const dateSample = Object.keys(item)[0];
    const index = dates.indexOf(dateSample);

    if (index > -1) {
      const value = item[dateSample] || 0;
      serie[index].y = value;

      // to accumulate the values per date
      dictionaryPerDay[dateSample] += value;
    }
  });

  return serie;
};

export const getExecutionDates = (
  aggregationItem: {
    [key: string]: AlResponderAggregationsSummaryItem[];
  }[]): { [key: string]: number } => {
  const datesDictionary: { [key: string]: number } = {};
  aggregationItem.forEach((aggregationPerItem) => {
    const valuesPerDates = Object.values(aggregationPerItem)[0];
    valuesPerDates.forEach((dateItem) => {
      const dateLabel = Object.keys(dateItem)[0];
      if (!datesDictionary[dateLabel]) {
        datesDictionary[dateLabel] = 0;
      }
    });
  });
  return datesDictionary;
};

export const getExecutionSeriesPlaybook = (
  dateDictionary: { [key: string]: number },
  datesSorted: string[],
  aggregationItem: {
    [key: string]: AlResponderAggregationsSummaryItem[];
  }[],
  aggregationWithIdItem: {
    [key: string]: AlResponderAggregationsSummaryItem[];
  }[]): BaseColumnConfigSeries[] => {
  processLastDateItem(datesSorted);
  const series = [];
  const colors = ['al-blue-500','al-purple-500', 'al-gray-500','al-orange-500','al-yellow-500'];
  aggregationItem.forEach((summary, index) => {
    const itemName = Object.keys(summary)[0];
    const shortName = itemName.length > 20 ? `${itemName.substring(0, 20)}...` : itemName;
    const valuesPerDates = summary[itemName];
    const recordLink = {
      playbook_ids: Object.keys(aggregationWithIdItem[index])[0]
    };
    series.push({
      name: shortName,
      className: colors[index],
      data: generateExecutionSeriesByItem(dateDictionary, datesSorted, valuesPerDates, recordLink),
      legendIndex: index
    });
  });
  return series;
};

export const calculateExecutionPercentaje = (
  dateDictionary: { [key: string]: number },
  datesSorted: string[],
  series: BaseColumnConfigSeries[]): void => {
  series.forEach(element => {
    element.data.forEach((item, index) => {
      const dateKey = datesSorted[index];
      const total = dateDictionary[dateKey];
      if (total) {
        item.percentage = Math.round((item.y / total) * 100);
      }
    });
  });
};


export const getExecutionSeriesTriggers = (
  dateDictionary: { [key: string]: number },
  datesSorted: string[],
  aggregationItem: {
    [key: string]: AlResponderAggregationsSummaryItem[];
  }[],
  triggerNames: {
    [key: string]: string;
  }
  ): BaseColumnConfigSeries[] => {
  processLastDateItem(datesSorted);
  const series = [];
  const colors = ['al-blue-500','al-purple-500', 'al-gray-500','al-orange-500','al-yellow-500'];
  aggregationItem.forEach((summary, index) => {
    const triggerId = Object.keys(summary)[0];
    const triggerName = triggerNames ? triggerNames[triggerId] : triggerId;

    const valuesPerDates = summary[triggerId];
    const recordLink = {
      trigger_ids: Object.keys(aggregationItem[index])[0]
    };
    series.push({
      name: triggerName,
      className: colors[index],
      data: generateExecutionSeriesByItem(dateDictionary, datesSorted, valuesPerDates, recordLink),
      legendIndex: index
    });
  });
  return series;
};
