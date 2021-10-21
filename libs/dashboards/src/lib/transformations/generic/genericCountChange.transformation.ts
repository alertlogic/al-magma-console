import { WidgetContent } from '@al/ng-visualizations-components';
import { isNumber } from 'util';

type ChangeType = "good" | "bad";

interface CountChange {
  primaryCount: number;
  changeCount: number;
  changeType: ChangeType;
}

/*
 * Looks at the dataConfig for the pattern "col(n)" and returns the number (n)
 * If the pattern is not matched then returns false
 */
const getColumn = (widgetContent: WidgetContent): number | boolean=> {
  let column: number | boolean = false;

  if (widgetContent && widgetContent.dataConfig !== null) {
    const dataPath: string = widgetContent.dataConfig.series[0].dataPath;
    const test = /^col\((\d+)\)$/.exec(dataPath);
    if (test) {
      column = Number(test[1]);
    }
  }
  return column;
};

/*
 *
 */
const getChange = (startAmount: number, endAmount: number): CountChange => {
  const changeAmount: number = endAmount - startAmount;
  return {
    primaryCount: endAmount,
    changeCount: Math.round(changeAmount * 100) / 100,
    changeType: changeAmount <= 0 ? "good" : "bad"
   };
};

/*
 *
 */
export const genericCountChange = (response: any, widgetContent?: WidgetContent): CountChange => {
  const multipleResponses: boolean = Array.isArray(response);
  const column: number | boolean = getColumn(widgetContent);
  let assetCountStart = 0;
  let assetCountEnd = 0;

  // Only proceed if a valid column is provided
  if (typeof column === 'number') {
    // When there are multipe responses the diff is derived from substracting the colum value in row
    // 1 from the column value in row 0
    if (multipleResponses) {
      assetCountStart = response[0].rows.length > 0 ? response[0].rows[0][<number>column] : 0;
      assetCountEnd = response[1].rows.length > 0 ? response[1].rows[0][<number>column] : 0;
    } else {
      // A single response means that the response is a trend type response, i.e. it'll have
      // an array of say, days. The diff performed here is by diffing the column value in the
      // last day from the column value in the first day
      const rowCount: number = response.rows.length;
      assetCountStart = rowCount > 0 ? response.rows[0][<number>column] : 0;
      assetCountEnd = rowCount > 0 ? response.rows[rowCount -1][<number>column] : 0;
    }
  }
  return getChange(assetCountStart, assetCountEnd);
};
