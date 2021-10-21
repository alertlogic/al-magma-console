/*
 *
 *
 */
import { ContactNumbers, DashboardConfigBase } from './dashboards.types';
import { Widget } from './widget.class';
import {
  Widget as WidgetConfig,
  WidgetContentType,
  WidgetButtonAction,
  WidgetButtonActionMethods,
  ZeroStateReason,
  ZeroState
} from '@al/ng-visualizations-components';
import {
  DashboardsClient,
  DashboardItemsListResponse,
  UserDashboardItem,
  SharedDashboardItem,
  SharedDashboardRef
} from '@al/dashboards';
import { DashboardsService } from './dashboards.service';

export class Dashboard {

  private hasLayout = false;
  private id: string;
  private title: string;
  private name: string;
  private refreshRate: number;
  private layoutFormat: string;
  private tags: string[];
  private uniqueRef: string;

  public telNumbers: ContactNumbers = {
    current: 'us',
    us: '+18774848383',
    uk: '+44203 011 5533'
  };

  // Array of Widget Classes - this is not the on-screen UI widget
  private widgets: Widget[] = [];

  // Array of UI widget configs
  public layout: WidgetConfig[] = [];

  /*
   *  Set the ID and name for this dashboard.  The ID allows for
   *  searching against its layout
   */
  constructor(item: UserDashboardItem | SharedDashboardItem | SharedDashboardRef, private dashboardService: DashboardsService) {
    this.id = item.id;
    this.layoutFormat = null;
    this.tags = [];
    this.uniqueRef = null;

    if (item.hasOwnProperty('dashboard_layout')) {
      this.name = (<UserDashboardItem>item).name;
      this.refreshRate = (<UserDashboardItem>item).dashboard_layout.refreshRate || 0;
      if ((<UserDashboardItem>item).dashboard_layout.hasOwnProperty('meta')) {
        this.layoutFormat = (<UserDashboardItem>item).dashboard_layout.meta.layoutFormat || '';
        this.tags = (<UserDashboardItem>item).dashboard_layout.meta.tags || [];
        this.uniqueRef = (<UserDashboardItem>item).dashboard_layout.meta.uniqueRef || '';
      }
      this.buildLayout(item as UserDashboardItem);
    } else {
      if (item.hasOwnProperty('shared_dashboard_ref')) {
        this.name = (<SharedDashboardRef>item).shared_dashboard_ref.name;
        this.refreshRate = (<SharedDashboardRef>item).shared_dashboard_ref.dashboard.dashboard_layout.refreshRate || 0;
        if ((<SharedDashboardRef>item).shared_dashboard_ref.dashboard.dashboard_layout.hasOwnProperty('meta')) {
          this.layoutFormat = (<SharedDashboardRef>item).shared_dashboard_ref.dashboard.dashboard_layout.meta.layoutFormat || '';
          this.tags = (<SharedDashboardRef>item).shared_dashboard_ref.dashboard.dashboard_layout.meta.tags || [];
          this.uniqueRef = (<SharedDashboardRef>item).shared_dashboard_ref.dashboard.dashboard_layout.meta.uniqueRef || '';
        }
      } else {
        this.name = (<SharedDashboardItem>item).name;
        if (item.hasOwnProperty('dashboard')) {
          this.refreshRate = (<SharedDashboardItem>item).dashboard.dashboard_layout.refreshRate || 0;
          if ((<SharedDashboardItem>item).dashboard.dashboard_layout.hasOwnProperty('meta')) {
            this.layoutFormat = (<SharedDashboardItem>item).dashboard.dashboard_layout.meta.layoutFormat || '';
            this.tags = (<SharedDashboardItem>item).dashboard.dashboard_layout.meta.tags || [];
            this.uniqueRef = (<SharedDashboardItem>item).dashboard.dashboard_layout.meta.uniqueRef || '';
          }
        }
      }
      this.buildLayoutFromBlob(item);
    }
  }

  /*
   *  Returns the supplied initial config
   */
  public getConfig(): DashboardConfigBase {
    return {
      id: this.id,
      name: this.name,
      refreshRate: this.refreshRate,
      layoutFormat: this.layoutFormat,
      tags: this.tags,
      uniqueRef: this.uniqueRef
    };
  }

  /*
   * Get a widget class by its ID
   */
  private getWidgetById(id: string): Widget {
    return this.widgets.find(item => item.id === id) || null;
  }

  /*
   * Build the entire layout including widgets and sources from a passed in BLOB
   * This is derived from a diconnected shared object. There will be no requirement to
   * go and make API calls to get any config
   */
  private buildLayoutFromBlob(dashboard: UserDashboardItem | SharedDashboardItem | SharedDashboardRef): WidgetConfig[] {
    this.hasLayout = true;

    // TODO Need to handle building from blobs for shared and user items here...
    // Eventually we should only ever be creating for users???
    let dashboardLayout;

    if (dashboard.hasOwnProperty('dashboard_layout')) {
      dashboardLayout = (<UserDashboardItem>dashboard).dashboard_layout;
    }
    if (dashboard.hasOwnProperty('shared_dashboard_ref')) {
      dashboardLayout = (<UserDashboardItem>dashboard).shared_dashboard_ref.dashboard.dashboard_layout;
    }
    if (dashboard.hasOwnProperty('dashboard')) {
      dashboardLayout = (<SharedDashboardItem>dashboard).dashboard.dashboard_layout;
    }

    if (dashboardLayout) {
      const items = dashboardLayout.widgets;

      items.forEach((item, index) => {
        const tmpWidget = new Widget(index.toString(), item);
        const widgetConfig = this.dashboardService.deepCopy(tmpWidget.getConfig());
        this.widgets.push(tmpWidget);
        this.layout.splice(item.config.position, 0, Object.assign(widgetConfig, {
          metrics: {
            height: item.config.height,
            width: item.config.width,
            position: item.config.position || 0
          }
        }));
      });
      return this.layout;
    }
    const defaultConfig: WidgetConfig[] = [];
    return defaultConfig;
  }


  /*
   * Build the layout of widget config from querying the widget classes
   */
  private buildLayout(dashboard: UserDashboardItem): WidgetConfig[] {
    if (this.widgets.length > 0  && dashboard.dashboard_layout) {
      this.hasLayout = true;
      const widgets = dashboard.dashboard_layout.widgets;

      for (const widget of widgets) {
        const widgetConfig = this.getWidgetById(widget.id).getConfig();
        this.layout.splice(widget.config.position, 0, Object.assign(widgetConfig, {
          id: widgetConfig.id,
          title: widgetConfig.title,
          actions: widgetConfig.actions,
          metrics: {
            height: widget.config.height,
            width: widget.config.width,
            position: widget.config.position || 0
          }
        }));
      }
      return this.layout;
    }
    const defaultConfig: WidgetConfig[] = [];
    return defaultConfig;
  }

  /*
   * Deep copy the data to stop any object by ref issues
   */
  private updateItemData(widgetId: string, data: any | ZeroState, items: WidgetConfig[]) {
    const pos = items.findIndex((item) => item.id === widgetId);
    const item = this.dashboardService.deepCopy(items.find(item => item.id === widgetId));
    const widget = this.getWidgetById(widgetId);
    // Override the UI widget action buttons with handlers for API and Entitlement failures
    switch (true) {
      case data.nodata && data.reason === ZeroStateReason.API:
        item.actions = {
          primary: {
            name: 'Refresh',
            action: {
              method: WidgetButtonActionMethods.Refresh
            }
          },
          link1: {
            name: "Call Support",
            action: {
              method: WidgetButtonActionMethods.Support,
              url: `tel:${this.telNumbers[this.telNumbers.current]}`
            }
          }
        };
        break;

      case data.nodata && data.reason === ZeroStateReason.Entitlement:
          item.actions = {
            primary: {
              name: "Contact Sales",
              action: {
                method: WidgetButtonActionMethods.Support,
                url: `https://www.alertlogic.com/get-started/?ContactSales=true`
              }
            }
          };
        break;

      case data.nodata && data.reason === ZeroStateReason.Zero:
        item.actions = {
          link1: {
            name: "Why is this graph empty?",
            action: {
              method: WidgetButtonActionMethods.NoData
            }
          }
        };
        delete item.actions.primary;
        break;

      default:
        const configuredActions = widget.getConfig().actions;
        if(configuredActions) {
          item.actions = configuredActions;
        }
    }

    if (item.content) item.content.data = this.dashboardService.deepCopy(data);
    items[pos] = item;
  }

  /*
   * Refresh an individual widget
   */
  public refreshWidget = (accountId: string, id: number, items: WidgetConfig[]): void => {
    const widget = this.widgets[id];
    widget.getData(accountId, this.dashboardService.appliedFilters)
      .then((response: any | ZeroState) => {
        this.updateItemData(widget.id, response, items);
      });
  }

  /*
   * Iterate through each widget class, calling its getData method.  When returned - inject it
   * into the passed widgets array
   */
  public getData = (accountId: string, items: WidgetConfig[]): Promise<any> => {
    return new Promise((resolve) => {
      const dataPromises: Promise<any>[] = [];
      for (const widget of this.widgets) {
        dataPromises.push(widget.getData(accountId, this.dashboardService.appliedFilters)
          .then((response: any | ZeroState) => {
            this.updateItemData(widget.id, response, items);
          })
        );
      }
      Promise.all(dataPromises)
      .then(() => {
        resolve(true);
      });
    });
  }

  /*
   * Call endpoint to get the layout for the dashboard if not yet loaded
   * or return it immediately if it has been retrieved
   *
   * userAccountId {string} - user's base account id
   * userId {string} - user id
   *
   */
  public getLayout = (userAccountId: string, userId: string): Promise<WidgetConfig[]> => {

    return new Promise((resolve, reject) => {

      // Return the layout immediately if it's already available
      if (this.hasLayout) {
        resolve(this.layout);
      } else {

        // Get the dashboard layout - this returns
        DashboardsClient.getUserDashboardItem(userAccountId, userId, this.id)
          .then((dashboard: UserDashboardItem) => {
            // The dashboard layout links to a number of widget IDs. Get the IDs of all associated widgets.
            if ((<UserDashboardItem>dashboard).dashboard_layout) {
              const widgetIds = (<UserDashboardItem>dashboard).dashboard_layout.widgets.map(item => item.id);
              const widgetResponses = [];

              // Create a new Widget Class for each linked widget ID - and for each widget execute its
              // load widget method
              for (const id of widgetIds) {
                const widget = new Widget(id);
                this.widgets.push(widget);
                widgetResponses.push(widget.loadConfig(userAccountId, userId));
              }

              // When all widgets' configs have returned use them to generate the
              // overall layout
              Promise.all(widgetResponses)
                .then(() => {
                  this.hasLayout = true;
                  resolve(this.buildLayout(<UserDashboardItem>dashboard));
                });
            } else {
              // means we have an item with no dashboard_layout prop, so a shared ref??
              reject('User Dashboard Item does not contain dashboard_layout property');
            }
          });
      }
    });
  }

}
