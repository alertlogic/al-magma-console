import { Widget as WidgetConfig, TableListConfig, ZeroStateReason } from '@al/ng-visualizations-components';
import { AlResponderInquiries, AlResponderPlaybook } from '@al/responder';

const createPlaybookDictionary = (playbooks: AlResponderPlaybook[]): { [key: string]: string } => {
  const dictionary = {};
  playbooks?.forEach(item => {
    dictionary[item.id] = item.name;
  });
  return dictionary;
};

const normalizeRejectedTaskAggregation = (response: AlResponderInquiries): {
  taskName: string;
  playbookName: string;
  playbookId: string;
  count: number;
}[] => {
  const summary: {
    taskName: string;
    playbookName: string;
    playbookId: string;
    count: number;
  }[] = [];
  const task = response?.aggregations?.responses[0].aggregations?.tasks;
  task.forEach(taskSummary => {
    const keys = Object.keys(taskSummary);
    const taskName = keys.find(key => key !== 'aggregations');

    taskSummary.aggregations.playbook_ids.forEach(playbookSummary => {
      const playbookId = Object.keys(playbookSummary)[0];
      const playbookTaskCount = Object.values(playbookSummary)[0];
      summary.push({
        taskName: taskName,
        playbookId: playbookId,
        playbookName: '',
        count: parseInt(playbookTaskCount as unknown as string, 10)
      });
    });
  });
  const summarySorted = summary.sort((a, b) => b.count - a.count).slice(0, 10);

  return summarySorted;
};

export const inquiryRejectedTask = (response: any, item?: WidgetConfig) => {
  if (response[0]?.aggregations?.responses?.length === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero
    };
  }
  const playbooks = createPlaybookDictionary(response[1]);
  const summarySorted = normalizeRejectedTaskAggregation(response[0]);

  // complement playbooks name
  summarySorted.forEach(item => {
    item.playbookName = playbooks[item.playbookId] || item.playbookId;
  });

  const tableConfig: TableListConfig = {
    headers: [
      { name: 'Task Name', field: 'taskName', class: 'left multiline-content' },
      { name: 'Playbook Name', field: 'playbookName', class: 'left multiline-content' },
      { name: 'Failed Count', field: 'count', class: 'right' }
    ],
    body: summarySorted
  };

  return tableConfig;
};
