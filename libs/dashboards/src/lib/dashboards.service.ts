import { Injectable } from '@angular/core';
import { DashboardConfigBase, DashboardFilter, DashboardFilters } from './dashboards.types';
import { DashboardItemsListResponse, UserDashboardItem, SharedDashboardItem, DashboardsClient, SharedDashboardRef } from '@al/dashboards';
import { Dashboard } from './dashboard.class';
import { AlNavigationService } from '@al/ng-navigation-components';
import { AlSession, AIMSClient } from '@al/core';

@Injectable({
  providedIn: 'root'
})

export class DashboardsService {

  private alSession = AlSession;
  public appliedFilters: DashboardFilters;

  constructor(
    private alNavigation: AlNavigationService
  ) {
    this.initialiseGlobalFilters();
  }


  /*
   *
   */
  public objectHasDeepProperty = (obj:any, path:string): boolean => {
    const props: string[] = path.split(',');

    if (obj === undefined) return false;
    if (path.length === 0) return true;

    for (let i = 0; i < props.length; i++) {
      if (!obj.hasOwnProperty(props[i])) {
        return false;
      }
      obj = obj[props[i]];
    }
    return true;
  }

  /*
   *
   */
  public accountManagesOthers = (accountId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      AIMSClient.getAccountIdsByRelationship(accountId, 'managed')
        .then((result) => {
          resolve(result.length > 0);
        })
        .catch(() => {
          resolve(false);
        });
    });
  }

  /*
   * Transforms a grid's data into a csv and initiates its download
   */
  public gridToCSV = (title: string, data): void => {
    if (!data.body || !data.headers) {
      throw new Error('Invalid data object sent to CSV processor');
    }
    const headers = data.headers;
    const rows = data.body;
    let csvContent = "";

    // Add headers
    csvContent += `${headers.map((header) => header.name).join(",")}\n`;

    for (const row of rows) {
      for (const header of headers) {
        const field = row[header.field];
        const value = typeof field === 'number'
          ? field
          : row[header.field] && row[header.field].replace(/"/g, "'");
        csvContent += `"${value}",`;
      }
      // Remove the end comma
      csvContent = csvContent.slice(0, -1);
      csvContent += '\n';
    }

    this.exportCSVContent(title, csvContent);
  }

  /*
   * Pass in data to be exported as CSV
   */
  public exportCSVContent = (title: string, data: string): void => {
    const csvContent = "data:text/csv;charset=utf-8,";
    if (data.length > 0) {
      const anchor = document.createElement('a');
      anchor.href = encodeURI(csvContent + data);
      anchor.target = "_blank";
      anchor.download = `${title.replace(/\s/g, "")}.csv`;
      anchor.click();
    }
  }

  /*
   * Deep copies simple objects.
   */
  public deepCopy(o: any): any {
    return JSON.parse(JSON.stringify(o));
  }

  /*
   * Generate the array of dashboard filter objects required to populate the
   * dashboard drop down picker
   */
  public generateDashboardFilters = (dashboardItems: (UserDashboardItem | SharedDashboardRef | SharedDashboardItem)[]): DashboardFilter[] => {

    return dashboardItems.map((item, idx: number) => {

      let itemName = 'No name found';
      let iconName = 'ui-icon-vertical-align-top';
      let displayOrder = 0;
      let dashboardConfig; // This needs a proper type, in @al/dashboards
      let tags: string[];
      if (item.hasOwnProperty('dashboard')) {
        dashboardConfig = (<SharedDashboardItem>item).dashboard;
        tags = dashboardConfig.dashboard_layout.meta.tags;
        itemName = dashboardConfig.dashboard_layout.name;
      } else if (item.hasOwnProperty('shared_dashboard_ref')) {
        dashboardConfig = (<SharedDashboardRef>item).shared_dashboard_ref.dashboard;
        tags = dashboardConfig.dashboard_layout.meta.tags;
        itemName = dashboardConfig.dashboard_layout.name;
      } else if (item.hasOwnProperty('dashboard_layout')) { // users own dashboards
        dashboardConfig = (<UserDashboardItem>item);
        itemName = dashboardConfig.name;
        iconName = 'ui-icon-dashboard';
      } else {
        console.warn(`An unexpected dashboard item encountered when generated dashboard picker options - ${item}`);
        return null;
      }

      displayOrder = dashboardConfig.dashboard_layout.index;
      if(tags && tags.includes('PARTNER')){
        iconName = 'ui-icon-contacts';
      }

      const filter: DashboardFilter = {
        label: itemName,
        icon: iconName,
        value: {
          id: item.id,
          name: itemName,
          code: idx
        },
        displayOrder: displayOrder
      };
      return filter;
    }).sort((a, b) => {
      return ( a as DashboardFilter ).displayOrder - ( b as DashboardFilter ).displayOrder;
    });
  }

  /*
   * Generate a Dashboard class for each of the supplied configs
   */
  public generateDashboards = (dashboardItems: UserDashboardItem[]): Dashboard[] => {
    return dashboardItems.map((item: UserDashboardItem) => {
      return new Dashboard(item, this);
    });
  }

  /*
   * Simulates initial setting of global dashboard filters, e.g. date ranges
   * This will change in a future release where the actual filter components will set public filter values in here to be
   * read in my other parts of the application
   */
  private initialiseGlobalFilters = () => {
    const endDate = new Date();
    this.appliedFilters = {
      start_date_time: new Date(new Date().setDate(endDate.getDate()-30)).setHours(0,0,0) / 1000,
      end_date_time: endDate.setHours(23,59,59) / 1000
    };
    this.appliedFilters.start_date_time_eod = new Date(this.appliedFilters.start_date_time * 1000).setHours(23, 59, 59, 59) / 1000;
    this.appliedFilters.end_date_time_sod = new Date(this.appliedFilters.end_date_time * 1000).setHours(0, 0, 0, 0) / 1000;
  }

  public updateUserSharedDashboardRefs = (sharedDashboardItems: SharedDashboardItem[]): Promise<boolean> => {
    const sharedRefUpdates = [];
    sharedDashboardItems.forEach(sharedItem => {
      sharedRefUpdates.push(DashboardsClient.createOwnDashboardItem(this.alSession.getPrimaryAccountId(), {
        type: 'shared_dashboard_ref',
        shared_dashboard_ref: {
          id: sharedItem.id,
          account_id: sharedItem.account_id
        }
      }));
    });
    console.log(`Updating user account with ${sharedDashboardItems.length} shared dashboard ref items...`);
    return new Promise((resolve, reject) => {
      Promise.all(sharedRefUpdates)
        .then(() => {
          console.log('User shared refs updated!');
          resolve(true);
        }).catch((err) => {
          reject(err);
        });
    });

  }

  public actingAccountHasDashboardEntitlement = (dashboard: UserDashboardItem | SharedDashboardItem) => {
    let dashboardEntitlements: string[] = [];
    if(dashboard.hasOwnProperty('shared_dashboard_ref')) {
      dashboardEntitlements = (<UserDashboardItem>dashboard).shared_dashboard_ref.dashboard._entitlements;
    }
    if(dashboard.hasOwnProperty('dashboard')) {
      dashboardEntitlements = (<SharedDashboardItem>dashboard).dashboard._entitlements;
    }
    if(dashboardEntitlements.length === 0) { // Assume for any non protected dashboards they should just be visibile anyway
      return true;
    }
    return this.alNavigation.evaluateEntitlementExpression(dashboardEntitlements.join('|'));
  }
}
