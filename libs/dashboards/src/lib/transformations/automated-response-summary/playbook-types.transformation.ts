import { Widget as WidgetConfig, ZeroStateReason } from '@al/ng-visualizations-components';
import { AlResponderPlaybook } from '@al/responder';
import { capitalizeFirstLetter } from '../transformation.utilities';


const createSeriePlaybookType = (playbookType: string) => {
  const name = capitalizeFirstLetter(playbookType);
  return {
    name: name,
    y: 0,
    className: 'al-blue-500',
    recordLink: {
      type: playbookType
    }
  };
};

export const playbookTypes = (response: AlResponderPlaybook[], item?: WidgetConfig) => {

  if (response.length === 0) {
    return {
      nodata: true,
      reason: ZeroStateReason.Zero
    };
  }

  const types = ['incident', 'observation', 'generic'];
  const dictionaryByType = {};

  types.forEach(item => {
    dictionaryByType[item] = createSeriePlaybookType(item);
  });

  response.forEach(playbook => {
    if (!dictionaryByType[playbook.type]) {
      dictionaryByType[playbook.type] = createSeriePlaybookType(playbook.type);
    }
    dictionaryByType[playbook.type].y++;
  });

  const staticValues = [];
  types.forEach(item => {
    staticValues.push(dictionaryByType[item]);
    delete dictionaryByType[item];
  });
  const otherValues = Object.values(dictionaryByType);
  const values = staticValues.concat(otherValues);

  const titles = values.map(item => item.name);

  return {
    title: "",
    yAxisType: "linear",
    dateOptions: titles,
    series: [{
      name: "",
      showInLegend: false,
      data: values
    }]
  };
};
