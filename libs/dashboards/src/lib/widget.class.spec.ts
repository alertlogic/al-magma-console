/*
 * Widget Class Test Suite
 *
 * @author robert.parker <robert.parker@alertlogic.com>
 * @copyright Alert Logic 2019
 *
 */

import { Widget } from './widget.class';
import { HealthSummaryResponse } from '@al/assets-query';
import { DashboardsClient, UserDashboardItem } from '@al/dashboards';

describe('Widget Class Test Suite', () => {
  let widget: Widget;
  const widgetConfig = {
    id: 'foo',
    name: 'some widget',
    content: {
      type: 'count'
    },
    actions: {
      primary: {}
    },
    data_source: {
      transformation: 'some_transformation',
      sources: [{
        service: 'iris',
        method: 'doStuff'
      }]
    }
  };
  const userAccountId = '2';
  const userId = '12345';
  const mockAPIResponse = {foo: 'bar'};
  const mockAPIResponseMultiple = [{foo: 'bar'}, {foo: 'bar'}];

  describe('on initialising the widget', () => {
    describe('with a string value passed into the constructor', () => {
      it('should assign the value to the widget id property', () => {
        const arg = 'foo';
        widget = new Widget(arg);
        expect(widget['id']).toEqual(arg);
      });
    });
    describe('with a widget config object passed into the constructor', () => {
      beforeEach(() => {
        widget = new Widget(widgetConfig.id, widgetConfig);
      });
      it('should assign the widget config name value to the widget class title prop', () => {
        expect(widget['title']).toEqual(widgetConfig.name);
      });
      it('should transform the widget config content type into a correctly formatted content object prop', () => {
        expect(widget['content']).toEqual({
          type: 3,
          options: null,
          data: null,
          presentation: null,
          dataConfig: null
        });
      });
      it('should assign the widget config actions value to the widget class actions prop', () => {
        expect(widget['actions']).toEqual(widgetConfig.actions);
      });
      it('should assign the widget config data_source transformation value to the widget class transformationType prop', () => {
        expect(widget['transformationType']).toEqual(widgetConfig.data_source.transformation);
      });
      it('should assign a newly constructed Source class to this widget source prop', () => {
        expect(widget['source']['sourceConfig']).toEqual({
          id: widgetConfig.id,
          name: '',
          dataSources: widgetConfig.data_source.sources
        });
      });
      it('should set hasWidget to true', () => {
        expect(widget['hasWidget']).toEqual(true);
      });
      describe('and retrieving its config', () => {
        it('should return a correctly constructed widget config object', () => {
          expect(widget.getConfig()).toEqual({
            id: widget.id,
            title: widget['title'],
            hideSettings: widget['hideSettings'],
            content: widget['content'],
            actions: widget['actions']
          });
        });

      });
    });
  });
  describe('When attempting to retrieving data for a source', () => {
    describe('but the source has not been loaded yet', () => {
      it('should throw an error', () => {
        widget = new Widget('foo');
        widget.getData('2', undefined).catch((err: Error) => {
          expect(err.message).toEqual('Get data method called on widget before its source configuration has loaded.');
        });
      });
    });
    describe('and a source config is present but with an unsupported transformation', () => {
      it('should throw an appropriate error', () => {
        widget = new Widget(widgetConfig.id, widgetConfig);
        jest.spyOn(widget['source'], 'getData').mockReturnValue(Promise.resolve({foo: 'bar'}));
        widget.getData('2', undefined).catch((err: Error) => {
          expect(err.message).toEqual(`Widget references a non-valid transformation [${widgetConfig.data_source.transformation}]`);
        });
      });
    });
    describe('and a valid source config is present', () => {
      beforeEach(() => {
        widgetConfig.data_source.transformation = 'unprotectedNodes';
        widget = new Widget(widgetConfig.id, widgetConfig);
      });
      describe('and data is returned for the source', () => {
        it('should perform the necessary transformation', () => {
          const response = {
            assets: [[4]]
          };
          jest.spyOn(widget['source'], 'getData').mockReturnValue(Promise.resolve(response));
          widget.getData('2', undefined).then((response) => {
            expect(response).toEqual({primaryCount: 4});
          });
        });
      });
      describe('and an error occurs when attempting to retrieve data for the source', () => {
        it('should return the error', () => {
          jest.spyOn(widget['source'], 'getData').mockReturnValue(Promise.reject('Some error'));
          widget.getData('2', undefined).then((response) => {
            expect(response).toEqual('Some error');
          });
        });
      });
    });
  });
  describe('when loading config for a given widget id', () => {
    const item: UserDashboardItem = {
      name: 'my item',
      id: 'xxx',
      type: 'widget_configuration',
      widget_configuration: {
        source: {
          id: '123',
          transformation: 'doStuff',

        },
        content: {
          type: 'count'
        },
        actions: {}
      }
    };
    it('should retrieve the item from the DashboardsClient and retrun an appropriate widget config object', () => {
      widget = new Widget('foo');
      jest.spyOn(DashboardsClient, 'getUserDashboardItem').mockReturnValue(Promise.resolve(item));
      widget.loadConfig('2', '12345').then((config) => {
        expect(config).toEqual({
          id: 'foo',
          title: item.name,
          hideSettings: false,
          content: {
            type: 3,
            data: null,
            options: null,
            presentation: null,
            dataConfig: null
          },
          actions: {}
        });
      });
    });
    describe('and the config has already been loaded for this widget', () => {
      it('should return the config immediately', () => {
        widget = new Widget(widgetConfig.id, widgetConfig);
        widget.loadConfig('2', '12345').then((config) => {
          expect(config).toEqual(widget.getConfig());
        });
      });
    });
  });
  describe('when determining the content type for a given string', () => {
    beforeEach(() => {
      widget = new Widget('foo');
    });
    it('should return the correct enum value', () => {
      expect(widget['contentTypeFromString']('column')).toEqual(0);
      expect(widget['contentTypeFromString']('word')).toEqual(1);
      expect(widget['contentTypeFromString']('semi_circle')).toEqual(2);
      expect(widget['contentTypeFromString']('count')).toEqual(3);
      expect(widget['contentTypeFromString']('tree_map')).toEqual(4);
      expect(widget['contentTypeFromString']('table_summary')).toEqual(5);
      expect(widget['contentTypeFromString']('bar')).toEqual(7);
    });
  });
});
