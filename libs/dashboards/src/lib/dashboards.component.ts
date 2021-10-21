/*
 * Dashboards Controller Component
 *
 * @author Stephen Jones <stephen.jones@alertlogic.com>
 * @author Robert Parker <robert.parker@alertlogic.com>
 * @copyright Alert Logic 2019
 *
 */
import { Component, Input, OnInit, ChangeDetectionStrategy, HostListener, ViewChild, ElementRef, OnDestroy} from '@angular/core';
import { Router, Event as NavigationEvent, NavigationStart, Navigation, UrlTree } from '@angular/router';
import { DashboardsService } from './dashboards.service';
import {
  AlSession,
  AlActingAccountResolvedEvent,
  AlSubscriptionGroup,
  AIMSAccount,
  AlTriggerSubscription,
  getUserTimezone,
  AlSearchClientV2,
  AlSearchStylist,
  AlSearchResultsQueryParamsV2
} from '@al/core';
import { DashboardConfigBase, ContactCountryCode, DashboardFilter } from './dashboards.types';
import { Dashboard } from './dashboard.class';
import { Widget as WidgetConfig, WidgetButtonAction, WidgetClickType, WidgetButtonActionMethods, ResultSetRequest } from '@al/ng-visualizations-components';
import { AlSelectorItem, AlSelectorComponent, AlTrackingMetricEventName, AlTrackingMetricEventCategory, AlDownloadQueueComponent, AlDownloadQueueDeleteResponse } from '@al/ng-generic-components';
import {
  AlNavigationService,
  AlNavigateOptions,
  AlNavigationFrameChanged,
  AlNavigationTrigger
} from '@al/ng-navigation-components';
import { MenuItem } from 'primeng/api';
import { timer, Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import {
  DashboardsClient,
  DashboardItemsListResponse,
  SharedDashboardItem,
  DashboardGroupsResponse,
  UserDashboardItem,
} from '@al/dashboards';
import { getServiceClient } from './source.utilities';
import { UserPreferencesService } from './user-preferences.service';

@Component({
  selector: 'app-dashboards',
  templateUrl: './dashboards.component.html',
  styleUrls: ['./dashboards.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})

export class DashboardsComponent implements OnInit, OnDestroy {
  private pendingDBRef: string = null;
  private defaultRefreshRate = 600;
  private dashboardTimer: Observable<number>;
  private dashboardTimerSubscription: Subscription;
  private actingAccountId: string;
  private userAccountId: string;
  private userId: string;
  private alSession = AlSession;
  private dashboards: Dashboard[] = [];
  private isFullScreen = false;
  private isDark = false;
  private currentDashboard = 0;
  private managesOthers = false;
  public layoutFormat: string = null;
  public dashboardFilters: DashboardFilter[] = [];
  public selectedDashboardFilter: DashboardFilter = undefined;
  public presentationItems: MenuItem[];
  public themeItems: MenuItem[];
  public presentationItemsFullscreen: MenuItem = { label: 'Full Screen', icon: 'ui-icon-fullscreen', command: (e) => { this.fullscreen(); } };
  public presentationItemsExitFullscreen: MenuItem = { label: 'Exit Full Screen', icon: 'ui-icon-fullscreen-exit', command: (e) => { this.fullscreen(); } };
  public displayEmptyGraphDlg = false;
  public selections: AlSelectorItem[] = [{
    name: "7d",
    value: "7d"
  }, {
    name: "14d",
    value: "14d"
  }, {
    name: "30d",
    value: "30d",
    selected: true
  }];
  private telCountryDest: ContactCountryCode = 'us';
  private currentUserDashboardItems: (UserDashboardItem | SharedDashboardItem)[]  = [];
  protected subscriptions = new AlSubscriptionGroup( null );
  private differ: any;
  private triggerSubscription: AlTriggerSubscription<any> = null;
  private lastSelectedDateRange: Date[] = [];
  private datePickerFullRangeSelectable = false;
  public selectedDateRange: Date[] | Date = [];
  public showNoDashboardsMsg = false;
  private readonly DATEPICKER_MAX_DAYS_HISTORY = 90;
  public datePickerMaxDate = new Date();
  public datePickerMinDate = new Date(new Date().setDate(this.datePickerMaxDate.getDate()-this.DATEPICKER_MAX_DAYS_HISTORY));
  public showDateControls = false;
  public showDateSelectionOptions = false;
  public datePickerSelectionMode: string;
  public datePickerInputFormat = 'dd M yy';
  private alSearchClientV2 = AlSearchClientV2;
  private alSearchStylist = AlSearchStylist;
  private timeout = null;
  private timer = 1000;
  private fileNames: { [uuid: string]: string } = {};

  @Input() layoutConfig: WidgetConfig[] = [];
  @Input() layoutConfigCopy: WidgetConfig[] = [];

  @ViewChild('dateRangeSelector') dateRangeSelector: AlSelectorComponent;
  @ViewChild('container', { static: true }) container: ElementRef;
  // Download queue
  @ViewChild(AlDownloadQueueComponent, { static: true }) downloadQueue: AlDownloadQueueComponent;

  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.container.nativeElement.requestFullscreen && event.code === 'KeyU' && event.ctrlKey) {
      this.fullscreen();
    }
    if (event.code === 'KeyD' && event.ctrlKey) {
      this.isDark = !this.isDark;
      this.applyDarkMode(this.isDark);
    }
  }

  constructor (
    private dashboardsService: DashboardsService,
    private userPreferencesService: UserPreferencesService,
    private alNavigation: AlNavigationService,
    private router: Router
  ) {}

  ngOnInit (): void {
    this.triggerSubscription =
      this.alNavigation.events.attach( AlNavigationFrameChanged, this.onNavigationChanged );
    this.container.nativeElement.addEventListener('fullscreenchange', (event) => { this.processFullscreen(); });
    this.container.nativeElement.addEventListener('webkitfullscreenchange', (event) => { this.processFullscreen(); });
    this.container.nativeElement.addEventListener('mozfullscreenchange', (event) => { this.processFullscreen(); });
    this.container.nativeElement.addEventListener('MSFullscreenChange', (event) => { this.processFullscreen(); });
    this.setupPresentationMenu();
    this.userAccountId = this.alSession.getPrimaryAccountId();
    this.setTelCountry();
    this.userId = this.alSession.getUserID();
    this.restoreUserDisplayPreferences();
    this.updateUserDashboardItems().then(() => {
      this.populateFromOwn();
      this.subscriptions.manage( AlSession.notifyStream.attach("AlActingAccountResolved", this.onActingAccountResolved ) );
      this.subscriptions.manage( AlSession.notifyStream.attach('AlActiveDatacenterChanged', this.reloadCurrentDashboard) );
    });
    this.router.events
      .pipe(filter((event: NavigationEvent) => event instanceof NavigationStart ))
      .subscribe((event: NavigationEvent) => this.routeChanged(event as NavigationStart));
    this.alNavigation.events.attach( "AlNavigationTrigger", this.onWelcomeDialogTriggered);
  }

  ngOnDestroy () {
    if (this.triggerSubscription) {
      this.alNavigation.events.detach(this.triggerSubscription);
    }
    this.subscriptions.cancelAll();
    this.cancelDasboardPoll();
  }

  onWelcomeDialogTriggered = (event: AlNavigationTrigger): void  => {
    if (event.triggerName === 'Navigation.Open.WelcomeDialog') {
      this.alNavigation.track(AlTrackingMetricEventName.UsageTrackingEvent, {
        category: AlTrackingMetricEventCategory.GenericConsoleAction,
        action: "Click",
        label: "What's New"
      });
    }
}

  // Pre-defined date range, e.g. 7d, 14d etc chosen from the selector.
  public dateRangeSelectorOnChange(range: String): void {
    const count: number = Number(range.replace(/[\D]/g, ''));
    const endDate = new Date((new Date()).setHours(23, 59, 59, 999));
    const startDate = new Date((new Date()).setHours(0, 0, 0, 0));

    startDate.setDate(startDate.getDate() - count);
    this.selectedDateRange = [startDate, endDate];
    this.lastSelectedDateRange = this.selectedDateRange;
    this.filterDate();
    this.alNavigation.track(AlTrackingMetricEventName.UsageTrackingEvent, {
      category: AlTrackingMetricEventCategory.DashboardAction,
      action: 'Change Date Range',
      label: `Date Picker - Last ${count} days`
    });
  }

  filterDate() {
    this.dashboardsService.appliedFilters.start_date_time = this.selectedDateRange[0].setHours(0, 0, 0, 0) /1000;
    this.dashboardsService.appliedFilters.end_date_time = this.selectedDateRange[1].setHours(23, 59, 59, 999) /1000;
    this.dashboardsService.appliedFilters.start_date_time_eod = new Date(this.dashboardsService.appliedFilters.start_date_time * 1000).setHours(23, 59, 59, 999) / 1000;
    this.dashboardsService.appliedFilters.end_date_time_sod = new Date(this.dashboardsService.appliedFilters.end_date_time * 1000).setHours(0, 0, 0, 0) / 1000;
    this.reloadCurrentDashboard();
  }

  selectDate() {
    this.dateRangeSelector.clear();
    let datePickerType = 'Date Picker - Start Date Only';
    if(!this.datePickerFullRangeSelectable) {
      this.selectedDateRange[1] = this.datePickerMaxDate;
    } else {
      if(!this.selectedDateRange[0] || !this.selectedDateRange[1]) {
        return;
      }
      datePickerType = 'Date Picker - Custom Range';
    }
    this.lastSelectedDateRange = (<Date[]>this.selectedDateRange);
    this.filterDate();
    this.alNavigation.track(AlTrackingMetricEventName.UsageTrackingEvent, {
      category: AlTrackingMetricEventCategory.DashboardAction,
      action: 'Change Date Range',
      label: datePickerType
    });
  }

  /*
   * Most support calls are routed to the US number but UK should point to the UK number
   * Look at the default_location, i.e. defender-us-denver.
   * If it contains anything other than -uk- in the middle then it defaults to the US
   * This is not 100% accurate but at the very least it will default to the US number
   * This is a silly implementation, quoth Kevin.
   */
  private setTelCountry = (): void => {
    const datacenterCountryMap = {
        'defender-us-denver': 'us',
        'defender-us-ashburn': 'us',
        'insight-us-virginia': 'us',
        'defender-uk-newport': 'uk',
        'insight-eu-ireland': 'uk'
    };

    const activeDatacenterId = this.alSession.getActiveDatacenter();

    if ( activeDatacenterId && datacenterCountryMap.hasOwnProperty( activeDatacenterId ) ) {
      this.telCountryDest = datacenterCountryMap[activeDatacenterId];
    } else {
      console.warn("Could not determine active datacenter from session; defaulting to US support information." );
    }
  }

  /*
   * When the resize event starts, make a copy of the data and strip out the content
   * objects.  This results in only rendering the widgets to aid faster browser
   * window resizing. No API calls are made here.
   */
  public resizeStart = (): void => {
    this.layoutConfigCopy = this.dashboardsService.deepCopy(this.layoutConfig);
    this.layoutConfig.map((item: WidgetConfig) => {
      item.content = null;
    });
  }

  /*
   *
   */
  public layoutFormatToClassName = (layoutFormat: string): string => {
    if (layoutFormat) {
      return `${layoutFormat.toLowerCase()}`;
    } else {
      return '';
    }
  }

  /*
   * When the user has completed resizing the browser - reinstatet the full
   * layout object so that the charts display again. No API calls are made here.
   */
  public resizeEnd = (): void => {
    this.layoutConfig = this.dashboardsService.deepCopy(this.layoutConfigCopy);
  }

  private applyDarkMode =   ( setDark = true, color?:string ) => {
    const body = document.querySelector('body');
    const html = document.querySelector('html');
    const preference = {
      isDark: setDark,
      color: color
    };

    this.isDark = setDark;
    body.classList.remove('darkMode');
    html.classList.remove('darkMode');
    body.classList.remove('blueMode');
    html.classList.remove('blueMode');

    if ( setDark && color === 'blue' ) {
      body.classList.add('blueMode');
      html.classList.add('blueMode');
    } else if ( setDark ) {
      body.classList.add('darkMode');
      html.classList.add('darkMode');
    }

    this.userPreferencesService.set('dark_mode_enabled', preference);
  }

  /*
   * Set up the presentation menu buttons. The last menu item 'full screen / exit fullscreen'
   * is dynamic based on whether or not the browser is in that state or not.
   */
  private setupPresentationMenu = () => {
    this.presentationItems = [
      {label: 'Light Mode', icon: 'ui-icon-brightness-low', command: (e) => { this.applyDarkMode(false); this.trackColorModeSelection('Light'); }},
      {label: 'Dark Mode', icon: 'ui-icon-brightness-high', command: (e) => { this.applyDarkMode(true); this.trackColorModeSelection('Dark'); }},
      {label: 'Blue Mode', icon: 'ui-icon-palette', command: (e) => { this.applyDarkMode(true, 'blue'); this.trackColorModeSelection('Blue'); }},
      {separator: true},
      {...this.presentationItemsFullscreen}
    ];
  }

  private trackColorModeSelection(colorMode: string) {
    this.alNavigation.track(AlTrackingMetricEventName.UsageTrackingEvent, {
      category: AlTrackingMetricEventCategory.DashboardAction,
      action: 'Choose Color Mode',
      label: colorMode
    });
  }

  /*
   * Toggles full screen mode.
   *
   * Currently 'fullscreenElement' is not support in Typescript.
   * Typescript only has the deprecated 'document.fullscreen'.  Using square brackets to use
   * the newer method.
   *
   */
  private fullscreen = () => {
    let requested = false;
    if (this.fullScreenElement()) {
      this.exitFullScreen(document);
    } else {
      this.requestFullScreen(this.container);
      requested = true;
    }
    this.alNavigation.track(AlTrackingMetricEventName.UsageTrackingEvent, {
      category: AlTrackingMetricEventCategory.DashboardAction,
      action: 'Toggle Screen Mode',
      label: requested ? 'Full Screen' : 'Normal Screen'
    });
    this.userPreferencesService.set('full_screen_enabled', requested);
  }

  /*
   * Vendor prefix checking to request full screen
   */
  private requestFullScreen = (elRef: ElementRef): void => {
    const el = elRef.nativeElement;
    if (el.requestFullscreen) {
      el.requestFullscreen();
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    } else if (el.mozRequestFullScreen) {
      el.mozRequestFullScreen();
    } else if (el.msRequestFullscreen) {
      el.msRequestFullscreen();
    }
  }

/*
   * Vendor prefix checking to determine if the browser is already full-screened
   */
  private fullScreenEnabled = (): boolean => {
    return document['fullscreenEnabled'] || document['webkitFullscreenEnabled'] || document['mozFullScreenEnabled'] || document['msFullscreenEnabled'];
  }

  /*
   * Vendor prefix checking to cancel full screen
   *
   */
  private exitFullScreen = (doc): void => {
    if (doc['exitFullscreen']) {
      doc.exitFullscreen();
    } else if (doc['webkitExitFullscreen']) {
      doc['webkitExitFullscreen']();
    } else if (doc['mozCancelFullScreen']) {
      doc['mozCancelFullScreen']();
    } else if (doc['msExitFullscreen']) {
      doc['msExitFullscreen']();
    }
  }

  /*
   * Vendor prefix checking to determine the if an element is in full screen
   */
  private fullScreenElement = (): boolean => {
    return document['fullscreenElement'] || document['webkitFullscreenElement'] || document['mozFullScreenElement'] || document['msFullscreenElement'];
  }

  /*
   * Change the menu items when the fullscreen status changes
   */
  private processFullscreen = () => {
    this.presentationItems.splice(4, 1, this.fullScreenElement()
      ? {...this.presentationItemsExitFullscreen}
      : {...this.presentationItemsFullscreen});
  }

  /*
   * TODO: Review login here after release 1 since we should no longer have to manage adding shared refs to users own list when they first visit the app
   * https://rally1.rallydev.com/#/16669046077/detail/userstory/318821788092
  */
  private updateUserDashboardItems = () => {
    this.actingAccountId = AlSession.getActingAccountId();
    return new Promise<void>((resolve, reject) => {
    // Retrieve both users own dashboard items and any shared ones available to the account they belong to
      Promise.all([this.getOwnDashboards(), this.getSharedDashboards()])
        .then((responses) => {
          const ownDashboardsResponse = responses[0] as DashboardItemsListResponse;
          const sharedDashboardsResponse = responses[1] as DashboardGroupsResponse;
          const ownLength: number = ownDashboardsResponse.dashboard_items.length;
          const sharedLength: number = sharedDashboardsResponse.dashboard_items.length;

          // Check to see if user has zero own items but shared ones are available
          if(ownLength === 0 && sharedLength > 0) {
            console.log(`User has no items in their own list, but there are ${sharedDashboardsResponse.dashboard_items.length} shared dashboards available to the user`);
            this.updateUserSharedRefs(sharedDashboardsResponse.dashboard_items, ownDashboardsResponse.dashboard_items as UserDashboardItem[])
            .then(() => {
              resolve();
            });
          }

          if(ownLength > 0 && sharedLength > 0) {
            console.log('User has items in their own list and shared ones available');
            // Need to to first figure out if any of the shared dashboards available to the user are not yet in their own list as shared_ref items
            // add any missing ones if so using this.dashboardsService.updateUserSharedDashboardRefs(...)
            const sharedRefItems = ownDashboardsResponse.dashboard_items.filter((ownItem) => {
              // First pick out any existing shared_dashboard_ref items from users own list
              if ((<UserDashboardItem>ownItem).shared_dashboard_ref) {
                return ownItem as UserDashboardItem;
              } else {
                  return null;
              }
            });
            // iterate over the shared dashboards available to the users account and prepare a list of ones that can be added as shared refs to their own list in a later step
            const availableSharedItems: SharedDashboardItem[] = [];
            sharedDashboardsResponse.dashboard_items.forEach((sharedDashboardItem) => {
              // see if user already has it as a shared ref in their own list of items by comparing dashboard id values
              let alreadyExists = false;
              sharedRefItems.forEach((sharedRef) => {
                if((<UserDashboardItem>sharedRef).shared_dashboard_ref.id === sharedDashboardItem.id) {
                  alreadyExists = true;
                }
              });
              if(!alreadyExists) {
                console.log(`User does not yet have the shared dashboard ${sharedDashboardItem.name} in their own list - need to add it`);
                availableSharedItems.push(sharedDashboardItem);
              }
            });
            this.updateUserSharedRefs(availableSharedItems, ownDashboardsResponse.dashboard_items as UserDashboardItem[])
              .then(() => {
                resolve();
              });
          }
        });
      });
  }

  private onActingAccountResolved = (event: AlActingAccountResolvedEvent) => {
    this.actingAccountId =  event.actingAccount.id;
    this.populateFromOwn();
  }

  private reloadCurrentDashboard = () => {
    this.dashboards[this.currentDashboard].getLayout(this.userAccountId, this.userId)
      .then((response: WidgetConfig[]) => {
        this.layoutConfig = this.dashboardsService.deepCopy(response);
        this.pollDashboard(this.currentDashboard, this.actingAccountId, this.layoutConfig);
      });
  }


  /*
   * Route has changed - possibly via back button - if so update the currently viewed dashboard
   */
  public routeChanged = (event: NavigationStart): void => {

    // Restored state is set when back button pressed
    if (event.restoredState) {
      const currentNavigation: Navigation = this.router.getCurrentNavigation();
      const initialUrl = <UrlTree>currentNavigation.initialUrl;
      const extractedUrl = <UrlTree>currentNavigation.extractedUrl;
      const prevDashboardRef = initialUrl.queryParams.dashboard;
      const prevAAID = initialUrl.queryParams.aaid;
      const currentDashboardRef = extractedUrl.queryParams.dashboard;
      const currentAAID = extractedUrl.queryParams.aaid;
      if (prevDashboardRef !== currentDashboardRef && prevAAID === currentAAID) {
        this.loadDashboard(this.currentDashboard, true, currentDashboardRef);
      }
    }
  }

  /*
   * Load the required dashboard by index
   */
  public selectDashboard = ( rawEvent: any ): void => {
    let event = rawEvent as DashboardFilter;
    const idx: number = event.value.code;
    // use internal navigation within the same app
    this.alNavigation.navigate.byNgRoute(["dashboards", "dashboards"], {queryParams: {dashboard: this.dashboards[idx]['uniqueRef']}});
    this.loadDashboard(idx);
  }

  /*
   * Load the dashboard layout from the required dashboard into the dashboard
   * config object.  A dashboard layout is an array of WidgetConfig objects.
   *
   */
  public loadDashboard = (idx: number, initialLoad: boolean = false, uniqueRef: string = null) => {

    // Dashboard currently selected in the picker
    let dashboard = this.dashboards[idx];
    let dashboardConfig = dashboard.getConfig();

    // An initial load can either grab the required dashboard from the URL (if included) or from localstorage
    if(initialLoad) {

      // Use a passed in ref or a ref from the URL
      const dashboardDeepLink: string = this.pendingDBRef || uniqueRef || this.alNavigation.queryParams['dashboard'] || null;
      if(dashboardDeepLink) {
        const lastViewedDashboard = this.dashboards.find((dashboard) => dashboard['uniqueRef'] === dashboardDeepLink);
        if(lastViewedDashboard) {
          dashboard = lastViewedDashboard;
          dashboardConfig = dashboard.getConfig();
        }
      } else {
        // Otherwise read from local storage
        const lastViewedDashboardId = this.userPreferencesService.get('last_visible_dashboard_id');
        if(lastViewedDashboardId) {
          // if found attempt to load that dashboard's config from the list of dashboards loaded in this component
          const lastViewedDashboard = this.dashboards.find((dashboard) => dashboard['uniqueRef'] === lastViewedDashboardId);
          if(lastViewedDashboard) {
            dashboard = lastViewedDashboard;
            dashboardConfig = dashboard.getConfig();
          }
        }
      }
    }

    this.pendingDBRef = null;

    // Store this dashboard as the last viewed dashboard
    this.userPreferencesService.set('last_visible_dashboard_id', dashboardConfig.uniqueRef);

    this.alNavigation.track(AlTrackingMetricEventName.UsageTrackingEvent, {
      category: AlTrackingMetricEventCategory.DashboardAction,
      action: 'View Dashboard',
      label: dashboardConfig.name
    });
    this.selectedDashboardFilter = this.dashboardFilters.find((dashboard) => {
      return dashboard.value.id === dashboardConfig.id;
    });
    return dashboard.getLayout(this.userAccountId, this.userId)
      .then((response: WidgetConfig[]) => {

        this.currentDashboard = this.dashboards.findIndex((dashboard: Dashboard) => dashboard.getConfig().id === dashboardConfig.id);
        this.layoutFormat = dashboardConfig.layoutFormat;

        // This is the initial layout config for this dshboard sans the data
        this.layoutConfig = this.dashboardsService.deepCopy(response);
        this.setupDateFilterControls(dashboardConfig);
        // Scroll top the top of the dashboard
        window.scrollTo(0,0);
        // Start polling the dashboard
        this.pollDashboard(this.currentDashboard, this.actingAccountId, this.layoutConfig);
        return this.layoutConfig;
      });
  }

  /*
   *
   */
  private cancelDasboardPoll = () => {
    if (this.dashboardTimerSubscription) {
      this.dashboardTimerSubscription.unsubscribe();
    }
  }

  /*
   * Poll the dashboard every n seconds.  Use the supplied refresh rate from the dashboard
   * or if none supplied use the default
   */
  private pollDashboard = (idx: number, accountId: string, layoutConfig: WidgetConfig[]) => {
    const dashboard = this.dashboards[idx];
    const config: DashboardConfigBase = dashboard.getConfig();
    const refreshRate: number = (config.refreshRate || this.defaultRefreshRate) * 1000;
    this.cancelDasboardPoll();
    this.dashboardTimer = timer(0, refreshRate);
    this.dashboardTimerSubscription = this.dashboardTimer.subscribe(() => {
      console.log(`Updating dashboard ${config.name} - [${config.id}] -> ${(new Date().toISOString())} -> [refreshRate: ${refreshRate / 1000} seconds]`);
      dashboard.getData(accountId, layoutConfig).then(()=>{
          this.refresh(true);
      });
    });
  }

  /*
   *
   */
  private getSharedDashboards = () => {
    return new Promise((resolve, reject) => {
      // Make the api call and contruct the dashboard filter selector objects and the Dashboard Classes
      return DashboardsClient.listDashboardGroups(this.userAccountId)
        .then((response: DashboardGroupsResponse) => {
          // If there is no dashboard index or the index is not a number then force it to 0 (zero)
          // It'll then just be place at the start
          response.dashboard_items.forEach((item) => {
            if (!item.dashboard.dashboard_layout.index || isNaN(item.dashboard.dashboard_layout.index)) {
              item.dashboard.dashboard_layout.index = 0;
            }
          });

          // Sort by index
          response.dashboard_items.sort((a,b) => a.dashboard.dashboard_layout.index - b.dashboard.dashboard_layout.index);
          resolve(response);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /*
   *
   */
  private setSupportTelNumber = () => {
    this.dashboards.forEach((dashboard) => {
      dashboard.telNumbers.current = this.telCountryDest;
    });
  }

  /*
   *
   */
  private populateFromOwn = async () => {

    // Determine if the current account manages other accounts - this will enable PARTNER dashboards
    // for those that do.
    this.managesOthers = await this.dashboardsService.accountManagesOthers(this.actingAccountId);

    // Extract items that are actual dashboard types (dont want to include widget and source here)
    const userDashboards = this.currentUserDashboardItems
      .filter(item => /^dashboard|dashboard_layout|shared_dashboard_ref$/.test(item.type))
      .filter(item => {
        let tags: string[];
        if(item.type === 'shared_dashboard_ref') {
          const dashboardRef = item.shared_dashboard_ref;
          if (this.dashboardsService.objectHasDeepProperty(item.shared_dashboard_ref, 'dashboard,dashboard_layout,meta,tags')) {
            tags = dashboardRef.dashboard.dashboard_layout.meta.tags;
          }
        }
        if(item.type === 'dashboard') {
          if (this.dashboardsService.objectHasDeepProperty(item, 'dashboard,dashboard_layout,meta,tags')) {
            tags = item.dashboard.dashboard_layout.meta.tags;
          }
        }
        if (tags && tags.some((i: string) => i === 'PARTNER')) {
          return this.managesOthers;
        }
        return this.dashboardsService.actingAccountHasDashboardEntitlement(item);
      });

    // Setup the dashboard selector drop down
    this.dashboardFilters = userDashboards.length > 0 ? this.dashboardsService.generateDashboardFilters(this.dashboardsService.deepCopy(userDashboards)) : [];
    this.showNoDashboardsMsg = this.dashboardFilters.length === 0;
    if(this.dashboardFilters.length === 0) {
      return;
    }
    // Build the dashboards
    this.dashboards = this.dashboardsService.generateDashboards(this.dashboardsService.deepCopy(userDashboards));
    // Update the support telephone number
    this.setSupportTelNumber();

    // Display the first dashboard
    this.loadDashboard(this.dashboardFilters[0].value.code, true);

  }

  /*
   * Make the endpoint call to get back the users's dashboards' layouts
   */
  private getOwnDashboards = () => {
    return new Promise((resolve, reject) => {
      // Make the api call and contruct the dashboard filter selector objects and the Dashboard Classes
      return DashboardsClient.listOwnDashboardItems(this.userAccountId)
        .then((response: DashboardItemsListResponse) => {
          resolve(response);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /*
   *
   */
  public widgetButtonActionHandler = (ev: CustomEventInit<{id: string; title: string, buttonAction: WidgetButtonAction, widgetButton: WidgetClickType, event: MouseEvent}>) => {
    const options: AlNavigateOptions = (ev.detail.event && (ev.detail.event.ctrlKey || ev.detail.event.metaKey)) ? { target: '_blank' } : {};
    const widgetId = ev.detail.id;
    const layoutWidget = this.layoutConfig.find(item => item.id === widgetId);
    const buttonAction = ev.detail.buttonAction;

    // If button action has been passed but it has no method or target_app then rack this
    if (buttonAction && (!buttonAction.target_app && !buttonAction.method)) {
      console.log(`Failed.  Investigate not configured on widget ${ev.detail.id}`);
    } else {

      // Target APP always takes precedence over method
      if(buttonAction.target_app) { // if a target_app exists means we need to redirect somewhere else
        if(buttonAction.path) {
          this.alNavigation.track(AlTrackingMetricEventName.UsageTrackingEvent, {
            category: AlTrackingMetricEventCategory.DashboardWidgetAction,
            action: 'Investigate',
            label: `${this.dashboards[this.currentDashboard].getConfig().name} - ${ev.detail.title}`
          });
        }
        if(buttonAction.query_params) {
          this.updateGlobalFilterParams(buttonAction.query_params);
        }
        this.alNavigation.navigate.byLocation(buttonAction.target_app, buttonAction.path, buttonAction.query_params, options);
      } else {
        if (buttonAction.method) {
          switch (buttonAction.method) {
            case WidgetButtonActionMethods.ExportCSV:
              this.dashboardsService.gridToCSV(layoutWidget.title, layoutWidget.content.data);
              this.alNavigation.track(AlTrackingMetricEventName.UsageTrackingEvent, {
                category: AlTrackingMetricEventCategory.DashboardWidgetAction,
                action: 'CSV Export',
                label: `${this.dashboards[this.currentDashboard].getConfig().name} - ${ev.detail.title}`
              });
              break;
            case WidgetButtonActionMethods.Refresh:
              this.dashboards[this.currentDashboard].refreshWidget(this.actingAccountId, Number(widgetId), this.layoutConfig);
              break;
            case WidgetButtonActionMethods.GetResultSet:
              // Get resultSet
              const resultSet = buttonAction.getResultSet;
              const useDownloadQueue: boolean = resultSet && resultSet.useDownloadSearchQueue;
              this.handleResultSet(resultSet, useDownloadQueue);
              break;
            case WidgetButtonActionMethods.Support:
              this.alNavigation.track(AlTrackingMetricEventName.UsageTrackingEvent, {
                category: AlTrackingMetricEventCategory.DashboardWidgetAction,
                action: 'Contact Support',
                label: `${this.dashboards[this.currentDashboard].getConfig().name} - ${ev.detail.title}`
              });
              if (buttonAction.url) {
                window.location.href = buttonAction.url;
              } else {
                console.log('No URL supplied for Support Action');
              }
              break;
          }
        }
      }
    }

    // If the widgets has no data - then show thw requiste dialog.
    // Note: No data is not the same as a fail
    // The object path may not exist - hence the catch
    this.displayEmptyGraphDlg = buttonAction.method && buttonAction.method === WidgetButtonActionMethods.NoData;
  }


  public viewFilteredRecords = async (ev: CustomEventInit<{buttonAction: WidgetButtonAction, targetApp: string, targetAppPath: string, targetArgs: {[p:string]:string}, event: MouseEvent}>) => {
    const options: AlNavigateOptions = (ev.detail.event && (ev.detail.event.ctrlKey || ev.detail.event.metaKey)) ? { target: '_blank' } : {};
    const targetArgs  = ev.detail.targetArgs || null;
    let targetAccount: AIMSAccount;
    if (targetArgs) {
      this.pendingDBRef = targetArgs['dashboard'];
      this.updateGlobalFilterParams(ev.detail.targetArgs);
      if(targetArgs.hasOwnProperty('aaid')) {
        targetAccount = await this.getManagedAccountRecord(ev.detail.targetArgs['aaid']);
        options.as = {
          accountId: targetAccount.id
        };
        delete targetArgs['aaid'];
      }
    }
    this.alNavigation.navigate.byLocation(ev.detail.targetApp, ev.detail.targetAppPath, ev.detail.targetArgs, options);
  }

  /*
   *
   */
  private restoreUserDisplayPreferences = () => {
    const darkModeEnabled = this.userPreferencesService.get('dark_mode_enabled');
    if(darkModeEnabled && darkModeEnabled.isDark) {
      this.applyDarkMode(darkModeEnabled.isDark, darkModeEnabled.color);
    }
    this.selectedDateRange[0] = new Date(this.dashboardsService.appliedFilters.start_date_time * 1000);
    this.selectedDateRange[1] = new Date(this.dashboardsService.appliedFilters.end_date_time * 1000);
    this.lastSelectedDateRange = (<Date[]>this.selectedDateRange);
  }

  private updateUserSharedRefs = (availableSharedItems: SharedDashboardItem[], userDashboardItems: UserDashboardItem[]): Promise< (UserDashboardItem | SharedDashboardItem)[]> => {
    return this.dashboardsService.updateUserSharedDashboardRefs(availableSharedItems)
      .then(() => {
        const dashboardItems: (UserDashboardItem | SharedDashboardItem)[] = availableSharedItems;
        this.currentUserDashboardItems = dashboardItems.concat(userDashboardItems);
        return this.currentUserDashboardItems;
      });
  }

  private updateGlobalFilterParams = (params: {[p:string]:string}) => {
    if(params.hasOwnProperty('startDate') && params['startDate'] === '<start_date_time>') {
      params['startDate'] = this.dashboardsService.appliedFilters.start_date_time.toString();
    }
    if(params.hasOwnProperty('endDate') && params['endDate'] === '<end_date_time>') {
      params['endDate'] = this.dashboardsService.appliedFilters.end_date_time.toString();
    }
  }

  private getManagedAccountRecord = (accountID: string) => {
    return AlSession.getManagedAccounts().then(managedAccounts => {
      return managedAccounts.find(acc => {
        return acc.id === accountID;
      });
    });
  }

  private setupDateFilterControls = (dashboardConfig: DashboardConfigBase) => {
    // restore range with min - max
    this.datePickerMaxDate = new Date();
    this.datePickerMinDate = new Date(new Date().setDate(this.datePickerMaxDate.getDate()-this.DATEPICKER_MAX_DAYS_HISTORY));
    if(dashboardConfig.hasOwnProperty('tags')) {
      const dashboardConfigTags = dashboardConfig.tags;
      this.showDateControls = dashboardConfigTags.includes('DATE_SHOW')
          || dashboardConfigTags.includes('DATE_RANGE')
          || dashboardConfigTags.includes('DATE_PICKER');

      if(dashboardConfigTags.includes('DATE_SHOW')) {
        this.datePickerSelectionMode = 'single';
        this.selectedDateRange = this.datePickerMaxDate;
        this.showDateSelectionOptions = false;
        this.datePickerInputFormat = 'DD, M dd, yy';
      } else if(dashboardConfigTags.includes('DATE_RANGE') || dashboardConfigTags.includes('DATE_PICKER')) {
        this.datePickerSelectionMode = 'range';
        this.showDateSelectionOptions = true;
        this.datePickerInputFormat = 'dd M yy';
        this.selectedDateRange = this.lastSelectedDateRange;
      }
      this.datePickerFullRangeSelectable = dashboardConfigTags.includes('DATE_PICKER');
      if (this.datePickerFullRangeSelectable) {
        this.datePickerMinDate = null;
      }
    } else {
      this.showDateControls = false;
    }
  }

  private onNavigationChanged = (event: AlNavigationFrameChanged): void => {
    if (event.experience === 'default') {
       this.alNavigation
           .navigate
           .byNamedRoute("cd17:overview:security",
                         {accountId: this.actingAccountId});
    }
  }

  /**
   * Handle resultSet request using a generic submit - status - stylist service api
   * or using the download-queue component and its api search service
   * @param resultSet - resultSet object from config file
   * @param useDownloadQueue - flag that indicates the use of 'download-queue' component
   */
  private handleResultSet = async (resultSet: ResultSetRequest, useDownloadQueue: boolean = true) => {
    useDownloadQueue = typeof useDownloadQueue === 'undefined' ? true : useDownloadQueue;
    const queryParams = resultSet.args.query_parameters ? this.applyDateParams(this.dashboardsService.deepCopy(resultSet.args.query_parameters)) : null;
    const fileName: string = resultSet.results ? resultSet.results.fileName : undefined;

    let uuid: string;
    if (useDownloadQueue) {
      const params: AlSearchResultsQueryParamsV2 = {
        from_epochtime: {
          utc_offset: getUserTimezone()
        }
      };
      this.downloadQueue.addSearch();
      uuid = await this.downloadQueue.submitSearch(this.actingAccountId, <string>resultSet.args?.body, queryParams, params, false);
      this.fileNames[uuid] = fileName;
    } else {
      const serviceClient: Function = getServiceClient(resultSet.service, this);
      const promise: Promise<any> = serviceClient[resultSet.method](resultSet.args.body, this.actingAccountId, queryParams);
      promise.then((response) => {
        if (response) {
          uuid = response[resultSet.uuidIdentifier];
          this.fileNames[uuid] = fileName;
          const status = response[resultSet.statusIdentifier];
          this.checkResultSet(uuid, status, resultSet);
        }
      }).catch((err) => {
          console.error(err);
      });
    }
  }

  /**
   * Check the resultSet petition by uuid and status
   * if the status is pending then check for the request status again
   * @param uuid - universal identifier
   * @param status - request status
   * @param resultSet - resultSet object from config file
   */
  private checkResultSet = (uuid: string, status: string, resultSet: ResultSetRequest) => {
    const completeStatusIdentifier: string = resultSet.status.completeStatusIdentifier;
    const pendingStatusIdentifier: string = resultSet.status.pendingStatusIdentifier;
    const suspendedStatusIdentifier: string = resultSet.status.suspendedStatusIdentifier;
    if (status === pendingStatusIdentifier || status === suspendedStatusIdentifier) {
      this.timeout = setTimeout(() => {
        this.checkResultSetStatus(uuid, resultSet);
      }, this.timer);
    } else if (status === completeStatusIdentifier) {
      this.downloadResultSet(uuid, resultSet);
    }
  }

  /**
   * Check the resultSet request status by uuid
   * and notify the new status to the resultSet checker
   * @param uuid - universal identifier
   * @param resultSet - resultSet object from config file
   */
  private checkResultSetStatus = (uuid: string, resultSet: ResultSetRequest) => {
    try {
      const statusService: string = resultSet.status.service;
      const statusMethod: string = resultSet.status.method;
      const searchStatusIdentifier: string = resultSet.statusIdentifier;
      const completeStatusIdentifier: string = resultSet.status.completeStatusIdentifier;
      const pendingStatusIdentifier: string = resultSet.status.pendingStatusIdentifier;
      const suspendedStatusIdentifier: string = resultSet.status.suspendedStatusIdentifier;
      if (statusService && statusMethod && searchStatusIdentifier) {
        const serviceClient: Function = getServiceClient(statusService, this);
        let status: string = null;
        // calling to status endpoint
        const promise: Promise<any> = serviceClient[statusMethod](this.actingAccountId, uuid);
        promise.then((statusResponse) => {
          if (!statusResponse) return;
          switch (statusResponse[searchStatusIdentifier]) {
            case completeStatusIdentifier:
              status = 'complete';
              break;
            case pendingStatusIdentifier:
              status = 'pending';
              break;
            case suspendedStatusIdentifier:
              status = 'suspended';
              break;
            default:
              status = 'error';
              break;
          }
          this.checkResultSet(uuid, status, resultSet);
        });
      }
    } catch (err) {
      console.error(err);
      return;
    }
  }

  /**
   * Use the results service service and method to download the results
   * @param uuid - universal identifier
   * @param resultSet - resultSet object from config file
   */
  private downloadResultSet = (uuid: string, resultSet: ResultSetRequest) => {
    try {
      const fetchResultsService: string = resultSet.results.service;
      const fetchResultsMethod: string = resultSet.results.method;
      const responseType: string = resultSet.results.type;
      const queryParams = resultSet.results.query_parameters ? this.applyDateParams(this.dashboardsService.deepCopy(resultSet.results.query_parameters)) : null;
      if (fetchResultsService && fetchResultsMethod) {
        const serviceClient: Function = getServiceClient(fetchResultsService, this);
        // calling to stylist endpoint
        const promise: Promise<any> = serviceClient[fetchResultsMethod](this.actingAccountId, uuid, responseType, queryParams);
        promise.then((results: Blob) => {
          this.exportData({results, searchId: uuid});
        });
      }
    } catch (err) {
      console.error(err);
      return;
    }
  }

  /**
   * Check if queryParams has '<start_date_time>' or '<end_date_time>'
   * and applies the date filter properly
   * @param queryParams - resultSet request query params
   * @returns same queryParams object with date filters applied
   */
  private applyDateParams(queryParams) {
    Object.keys(queryParams).forEach((item: string) => {
      if (queryParams[item] === '<start_date_time>') {
        queryParams[item] = Math.trunc(this.dashboardsService.appliedFilters.start_date_time);
      }
      if (queryParams[item] === '<end_date_time>') {
        queryParams[item] = Math.trunc(this.dashboardsService.appliedFilters.end_date_time);
      }
      if (item === 'utc_offset') {
        queryParams[item] = getUserTimezone();
      }
    });
    return queryParams;
  }

  /**
   * Download the csv file when its ready
   * @param evt - response from download-queue with results as Blob and its searchId
   */
  public exportData = (evt: {results: Blob, searchId: string}) => {
    const uuid = evt.searchId;// uuid
    const blobURL = window.URL.createObjectURL(evt.results);
    const tempLink = document.createElement('a');
    const fileName: string = this.fileNames[uuid];
    tempLink.href = blobURL;
    tempLink.download = fileName ? fileName : 'response_data.csv';
    tempLink.click();
  }

  /** Function to force the highcharts to update after changing account */
  public refresh(update:boolean = true){
    if(update){
      document.getElementById('refresh').click();
    }
  }

  /**
   * Deletes the file entry from the fileNames map
   * @param evt - response from download-queue with queue length, deleted index and if cancelled
   */
  public deleteFileName(response: AlDownloadQueueDeleteResponse): void {
    delete this.fileNames[response.uuid];
  }

  @HostListener("window:scroll")
  onWindowScroll() {
    this.container.nativeElement.click();
  }
}
