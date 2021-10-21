import { Widget as WidgetConfig, TableListConfig, ZeroStateReason } from '@al/ng-visualizations-components';
import { AlResponderAggregationsSummaryItem } from '@al/responder';

export const summarizeAssetGroup = (items: AlResponderAggregationsSummaryItem[]): number => {
  let count = 0;
  items.forEach(summary => {
    count = count + (Object.values(summary)?.[0] as number);
  });
  return count;
};

export const processAssetGroup = (assetGroups: {
  [key: string]: number | {
    trigger_ids: AlResponderAggregationsSummaryItem[];
    playbook_ids: AlResponderAggregationsSummaryItem[];
  }
}[]): {
  asset_group: string;
  count_trigger: number;
}[] => {
  const assetGroup: {
    asset_group: string;
    count_trigger: number;
  }[] = [];
  assetGroups.forEach(element => {
    const assetName = Object.keys(element).filter(elementKey => elementKey !== 'aggregations')[0];
    const triggerCount = element['aggregations']['trigger_ids'].length;
    assetGroup.push({ asset_group: assetName, count_trigger: triggerCount });
  });
  return assetGroup;
};

export const assetGroupByTrigger = (response, item?: WidgetConfig) => {
  if (response.aggregations.asset_groups.length === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero
    };
  }
  const summary = processAssetGroup(response.aggregations.asset_groups);

  const tableConfig: TableListConfig = {
    headers: [
      { name: 'Asset Group', field: 'asset_group', class: 'left multiline-content' },
      { name: 'Trigger Count', field: 'count_trigger', class: 'right' }
    ],
    body: summary
  };

  return tableConfig;
};
