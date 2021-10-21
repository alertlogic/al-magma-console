import { Widget as WidgetConfig, ZeroStateReason } from '@al/ng-visualizations-components';
import { BaseColumnConfig } from '../base_objects.transformation';
import { SeverityCountSummaries } from '../kalm.named_query_response.types';

interface RecordLink {
  threat: string;
  deployment: string;
}

interface DataItem {
  x: number;
  y: number;
  recordLink: RecordLink;
}

const buildRecordLink = (threatLevel: string, deploymentName: string): RecordLink => {
  return {
    threat: threatLevel,
    deployment: deploymentName
  };
};

const sortDeployments = (data: []): string[] => {
  return Object.keys(data).sort((a,b) => data[b].count - data[a].count);
};

const generateSeries = (type: string, data: []): DataItem[] => {
  const deployments = sortDeployments(data);
  return deployments.map((item, idx) => {
    return {
      x: idx,
      y: data[item]['incident.threatRating'][type] || 0,
      recordLink: buildRecordLink(type, deployments[idx] as string)
    };
  });
};

export const tenMostAttackedDeployments = (response: any) => {
  const data: any = response.aggregations.createtime_str.date_period['assets.al__deployment'];
  const deployments: string[] = sortDeployments(data);
  const rowsAsString: string = JSON.stringify(data);
  const config: BaseColumnConfig = {
    title:  '',
    description: 'Count of Incidents',
    dateOptions: deployments,
    series: [{
      name: 'Info',
      data: generateSeries('None', data),
      className: 'info2',
      legendIndex: 4
    }, {
      name: 'Low',
      data: generateSeries('Low', data),
      className: 'info',
      legendIndex: 3
    }, {
      name: 'Medium',
      data: generateSeries('Medium', data),
      className: 'low',
      legendIndex: 2
    }, {
      name: 'High',
      data: generateSeries('High', data),
      className: 'medium',
      legendIndex: 1
    },{
      name: 'Critical',
      data: generateSeries('Critical', data),
      className: 'critical',
      legendIndex: 0
    }].filter(item => {
      const name: string = item.name === "Info" ? "None" : item.name;
      return (new RegExp(name)).test(rowsAsString);
    })
  };
  return config;
};
