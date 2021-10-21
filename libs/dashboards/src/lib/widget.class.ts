/*
 *
 *
 */
import {
  ZeroStateReason,
  ZeroState,
  WidgetContentType,
  WidgetContent,
  Widget as WidgetConfig,
  WidgetMetrics
} from '@al/ng-visualizations-components';
import { Source } from './source.class';
import * as Transformations from './transformations';
import {
  DashboardsClient,
  DashboardItemsListResponse,
  UserDashboardItem,
  DashboardWidgetConfig
} from '@al/dashboards';
import { DashboardsService } from './dashboards.service';
import { DashboardFilters } from './dashboards.types';

export class Widget {

  public id: string;

  private source: Source = null;
  private hasWidget = false;

  private title = '';
  private hideSettings = false;
  private actions;
  private content: WidgetContent;
  private transformationType: string;
  private metrics: WidgetMetrics;

  constructor (id: string, config?: any) {
    this.id = id;
    if (config) {
      this.loadConfigFromBlob(config);
    }
  }

  /*
   * Deep copies simple objects.
   */
  private deepCopy(o: any): any {
    return JSON.parse(JSON.stringify(o));
  }

  /*
   * The widget itself is not responsible for its height, width or position.
   * Nor can we glean it from this point, hhence the 'Partial'
   */
  public getConfig = (): Partial<WidgetConfig> => {
    return {
      id: this.id,
      title: this.title,
      hideSettings: this.hideSettings,
      content: this.content,
      actions: this.actions
    };
  }

  /*
   * Each widget's config has a transformation type.  This is the method to execute
   * against the data returned from the source.  It converts the data into a consumable
   * object for the widget's content.
   */
  private transformData = (data: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (Transformations[this.transformationType]) {
          resolve(Transformations[this.transformationType](data, this.content));
      } else {
        reject(new Error(`Widget references a non-valid transformation [${this.transformationType}]`));
      }
    });
  }

  /*
   * Call the getData method of the Source and when received convert
   * it into the consumable object required by the widget's content
   */
  public getData = (accountId: string, appliedFilters: DashboardFilters): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!this.source) {
        reject(new Error('Get data method called on widget before its source configuration has loaded.'));
      } else {
        this.source.getData(accountId, appliedFilters)
          .then((response) => {
            this.transformData(response)
              .then((data) => {
                this.content.data = data;
                resolve(this.content.data);
              }).catch((err) => {
                reject(err);
              });

          })
          .catch((e: ZeroState) => {
            this.content.data = this.deepCopy(e);
            resolve(this.content.data);
          });
      }
    });
  }

  /*
   *
   */
  private contentTypeFromString = (contentTypeString: string): WidgetContentType => {
    switch (contentTypeString) {
      case 'count':
        return WidgetContentType.Count;
      case 'semi_circle':
        return WidgetContentType.SemiCircle;
      case 'column':
        return WidgetContentType.Column;
      case 'word':
        return WidgetContentType.Word;
      case 'table_summary':
        return WidgetContentType.TableListSummary;
      case 'tree_map':
        return WidgetContentType.TreeMap;
      case 'bar':
        return WidgetContentType.Bar;
      case 'bubble':
        return WidgetContentType.Bubble;
      case 'activity_gauge':
        return WidgetContentType.ActivityGauge;
      case 'doughnut':
        return WidgetContentType.Doughnut;
      case 'map':
        return WidgetContentType.Map;
      case 'area':
        return WidgetContentType.Area;
      case 'line':
        return WidgetContentType.Line;
      case 'heat_map':
        return WidgetContentType.HeatMap;
      case 'funnel':
        return WidgetContentType.Funnel;
      case 'multi_trend':
        return WidgetContentType.MultiTrend;
      case 'map_country_distribution':
        return WidgetContentType.MapCountryDistribution;
    }
    return null;
  }

  /*
   *
   */
  private processConfigResponse(widget: UserDashboardItem): void {
    const itemConfig = (<UserDashboardItem>widget).widget_configuration;

    this.title = widget.name;
    this.content = {
      type: this.contentTypeFromString(itemConfig.content.type),
      options: itemConfig.content.options || null,
      presentation: itemConfig.content.presentation || null,
      data: null,
      dataConfig: itemConfig.content.dataConfig || null,
    };
    this.actions = itemConfig.actions;
    this.transformationType = itemConfig.source.transformation;
  }

  /*
   *
   */
  private loadConfigFromBlob = (itemConfig: any) => {
    this.title = itemConfig.name;
    this.content = {
      type: this.contentTypeFromString(itemConfig.content.type),
      options: itemConfig.content.options || null,
      presentation: itemConfig.content.presentation || null,
      data: null,
      dataConfig: itemConfig.content.dataConfig || null
    };
    this.actions = Object.assign({}, itemConfig.actions);
    this.transformationType = itemConfig.data_source.transformation;
    this.source = new Source({
      id: this.id,
      name: '',
      dataSources: itemConfig.data_source.sources
    });
    this.hasWidget = true;
  }

  /*
   * Call out to the Dashboards End Point to grab the config
   * for this widget.  If this has already been done just return
   * the config.
   */
  public loadConfig = (userAccountId: string, userId: string) => {
    // Return the widget config immediately if it's already available
    return new Promise((resolve, reject) => {
      if (this.hasWidget) {
        resolve(this.getConfig());
      } else {

        // Get the widget config
        DashboardsClient.getUserDashboardItem(userAccountId, userId, this.id)
          .then((widget: UserDashboardItem) => {
            // We have the widget - now get its source
            this.source = new Source(widget.widget_configuration.source.id);
            this.source.loadConfig(userAccountId, userId)
              .then(() => {
                this.hasWidget = true;
                this.processConfigResponse(widget);
                resolve(this.getConfig());
              });
          });
      }
    });
  }
}
