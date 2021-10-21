import { genericCountChange } from '../genericCountChange.transformation';
import { WidgetContent, WidgetContentType } from '@al/ng-visualizations-components';

describe('Generic Count Change Transformation Test Suite:', () => {
  describe('When processing a multi response object with a postive change amount', () => {
    it('should use the dataPath col index in the widget config to create the correct count change config', () => {
      const widgetContent: WidgetContent = {
        type: WidgetContentType.Count,
        dataConfig: {
          series: [{
            dataPath: 'col(0)'
          }]
        }
      };
      const responses = [{
        rows: [[1]]
      },{
        rows: [[5]]
      }];
      expect(genericCountChange(responses, widgetContent)).toEqual({
        primaryCount: 5,
        changeCount: 4,
        changeType: "bad"
      });
    });
  });
  describe('When processing a multi response object with a negative change amount', () => {
    it('should use the dataPath col index in the widget config to create the correct count change config', () => {
      const widgetContent: WidgetContent = {
        type: WidgetContentType.Count,
        dataConfig: {
          series: [{
            dataPath: 'col(0)'
          }]
        }
      };
      const responses = [{
        rows: [[5]]
      },{
        rows: [[1]]
      }];
      expect(genericCountChange(responses, widgetContent)).toEqual({
        primaryCount: 1,
        changeCount: -4,
        changeType: "good"
      });
    });
  });
  describe('When processing a multi response object with zero rows in both responses', () => {
    it('should use the dataPath col index in the widget config to create the correct count change config', () => {
      const widgetContent: WidgetContent = {
        type: WidgetContentType.Count,
        dataConfig: {
          series: [{
            dataPath: 'col(0)'
          }]
        }
      };
      const responses = [{
        rows: []
      },{
        rows: []
      }];
      expect(genericCountChange(responses, widgetContent)).toEqual({
        primaryCount: 0,
        changeCount: 0,
        changeType: "good"
      });
    });
  });
  describe('When processing a single response object with a positive change amount', () => {
    it('should use the dataPath col index in the widget config to create the correct count change config', () => {
      const widgetContent: WidgetContent = {
        type: WidgetContentType.Count,
        dataConfig: {
          series: [{
            dataPath: 'col(2)'
          }]
        }
      };
      const responses = {
        rows: [
          ['2020-03-03', 5, 5, 5],
          ['2020-03-03', 5, 5, 5],
          ['2020-03-03', 5, 10, 5]
        ]
      };
      expect(genericCountChange(responses, widgetContent)).toEqual({
        primaryCount: 10,
        changeCount: 5,
        changeType: "bad"
      });
    });
  });
  describe('When processing a single response object with zero rows of data', () => {
    it('should return a zero count config object', () => {
      const widgetContent: WidgetContent = {
        type: WidgetContentType.Count,
        dataConfig: {
          series: [{
            dataPath: 'col(2)'
          }]
        }
      };
      const responses = {
        rows: []
      };
      expect(genericCountChange(responses, widgetContent)).toEqual({
        primaryCount: 0,
        changeCount: 0,
        changeType: "good"
      });
    });
  });
  describe('When processing a single response object with a widget config containing a non numeric dataPath index', () => {
    it('should return a zero count config object', () => {
      const widgetContent: WidgetContent = {
        type: WidgetContentType.Count,
        dataConfig: {
          series: [{
            dataPath: 'col(x)'
          }]
        }
      };
      const responses = {
        rows: []
      };
      expect(genericCountChange(responses, widgetContent)).toEqual({
        primaryCount: 0,
        changeCount: 0,
        changeType: "good"
      });
    });
  });
  describe('When processing a single response object with no widget config supplied', () => {
    it('should return a zero count config object', () => {
      const responses = {
        rows: []
      };
      expect(genericCountChange(responses)).toEqual({
        primaryCount: 0,
        changeCount: 0,
        changeType: "good"
      });
    });
  });
});
