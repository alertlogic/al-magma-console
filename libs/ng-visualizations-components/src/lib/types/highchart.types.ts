/*
 * @author Stephen Jones <stephen.jones@alertlogic.com>
 * @copyright Alert Logic, Inc 2019
 *
 */

/*
 *  Proportional widget width.  Widget width is controlled by its container.  This proportional
 *  width determines how many cells on the X axis a widget will take up
 */
export enum WidgetWidth {
  W1 = 1,
  W2,
  W3,
  W4,
}

/*
 *  Proportional widget height.  Widget height is controlled by its container.  This proportional
 *  height determines how many cells on the Y axis a widget will take up
 */
export enum WidgetHeight {
  H1 = 1,
  H2,
  H3,
  H4,
}

/*
 *  Used to emit which Widget Button was clicked
 */
export enum WidgetClickType {
  Settings,
  Primary,
  Link1,
  Link2,
  DrillDown
}

/*
 *
 */
export enum WidgetContentType {
  Column,
  Word,
  SemiCircle,
  Count,
  TreeMap,
  TableListSummary,
  ActivityGauge,
  Bar,
  Area,
  Bubble,
  Doughnut,
  Map,
  Line,
  HeatMap,
  Funnel,
  MultiTrend,
  MapCountryDistribution
}


/*
 * Zero state reason for not displaying a chart
 */
export enum ZeroStateReason {
  API,
  Entitlement,
  Zero
}

/*
 *
 */
export interface ZeroState {
  nodata: boolean;
  reason: ZeroStateReason;
  title?: string;
  icon?: string;
}

/*
 *
 */
export interface WidgetConfigOptions {
  ignoreFooter?: boolean;
}

/*
 * Widget content - can be anything such as a chart, grid, number etc
 */
export interface WidgetContent {
  type: WidgetContentType;
  options?: WidgetConfigOptions;
  data?: any;
  presentation?: any;
  dataConfig?: {
    series: {
        name?: string;
        dataPath: string;
        cssClassNames?: string;
    }[];
  };

}

/*
 * Height, Width and Position metrics for a UI widget
 */
export interface WidgetMetrics {
  height: WidgetHeight;
  width: WidgetWidth;
  position?: number;
}

/*
 * UI only - component configuration
 */
export interface Widget {
  id: string;
  title: string;
  hideSettings?: boolean;
  content?: WidgetContent;
  metrics: WidgetMetrics;
  refreshSource?: {
    service: string;
    args?: any;
    method: string;
  };
  refreshDate?: string;
  actions?: {
    primary?: {
      name: string,
      action?: WidgetButtonAction;
    };
    link1?: {
      name: string,
      action?: WidgetButtonAction;
    };
    link2?: {
      name: string,
      action?: WidgetButtonAction;
    };
    settings?: string;
    drilldown?: {
      name: string,
      action?: WidgetButtonAction;
    };
  };
}

export enum WidgetButtonActionMethods {
  ExportCSV = 1,
  NoData,
  Support,
  Refresh,
  GetResultSet,
  CustomZeroState
}

export interface WidgetButtonAction {
  target_app?: string;
  path?: string;
  url?: string;
  noData?: boolean;
  method?: WidgetButtonActionMethods;
  query_params?: {
    [p: string]: string
  };
  getResultSet?: ResultSetRequest;
}

/*
 * Three display formats are
 *
 * Split - 14 / 100
 * Percentage - 14%
 * ValueOnly - 14
 */
export enum ActivityGaugeValueFormat {
  Split,
  Percentage,
  ValueOnly
}

/*
 * AlHighchartsActivityGaugeComponent Interface
 *
 * @value {number} - gauge value
 * @maxValue {number} - max value - used to calculate %age and display a n / n value
 * @bodyText {string} - text to show in guage under the value
 * @footerText {string} - text to show under and outside of the guage
 * @gaugeClass {string} - optional color of gauge
 * @gaugeBackgroundClass {string} - optional backgroundColor of gauge
 * @overrunClass {string} - optional color of gauge when value exceeds maxValue
 */
export interface ActivityGaugeConfig {
  value: number;
  maxValue: number;
  valueFormat: ActivityGaugeValueFormat;
  contractValues?: boolean;
  bodyText?: string;
  footerText?: string;
  gaugeClass?: string;
  gaugeBackgroundClass?: string;
  overrunClass?: string;
  tooltip?: string;
}

export interface TableListHeader {
  name: string;
  field: string;
  class?: string;
  style?: string;
}

export interface TableListConfig {
  headers: TableListHeader[];
  body: {
    [p: string]: string | number | boolean | TableCellConfig | {
                                                [p:string]: string | number | boolean;
                                              };
  }[];
  sortable?: boolean;
  defaultSortField?: string;
  defaultSortOrder?: -1 | 1;
}

interface TableCellConfig {
  value: string | number;
  cssName?: string;
  recordLink?: WidgetButtonAction;
}

export enum CountSummaryChangeType {
  Good = "good",
  Bad = "bad"
}

export interface CountSummaryMeta {
  value: number;
  title: string;
  color: string;
}

export interface CountSummaryData {
  primaryCount: number;
  changeCount?: number;
  changeType?: CountSummaryChangeType;
  additionalMeta?: CountSummaryMeta[];
}

export enum CountSummaryChangeDirection {
  Up,
  Down,
  Flat
}

export interface CountSummaryPresentation {
  changeColorGood?: string;
  changeColorBad?: string;
  changeColorFlat?: string;
  showPercentage?: boolean;
  primaryFontSize?: number;
  changeAmountLabel?: string;
  percentageAmountLabel?: string;
}

export interface DashboardWidgetClickDetails {
    event?: MouseEvent;
    buttonAction?: WidgetButtonAction;
    widgetButton?: WidgetClickType;
    id?: string;
    title?: string;
    targetApp?: string;
    targetAppPath?: string;
    targetArgs?: { [p: string]: string } | WidgetButtonAction;
}

export interface MapGeoCoords {
  lon: number;
  lat: number;
}

export interface MapDistributionPresentation {
  colorScheme?: string[];
  seriesNames?: string[];
}

// Only the value and long / lat is required - but supply country code if available
// as it saves any long / lat to country code lookups
export interface MapDistributionDataItem {
  code?: string; // 2 char iso country code
  name?: string; // Country name
  recordLink?: WidgetButtonAction;
  coords?: MapGeoCoords; // Long / Lat
  value: number; // Count
}

export type MapDistributionDataSet = MapDistributionDataItem[];

export interface ResultSetRequest {
  service: string;
  method: string;
  uuidIdentifier?: string;
  statusIdentifier?: string;
  useDownloadSearchQueue?: boolean;
  args?: {
    query_parameters?: unknown;
    body?: unknown;
  };
  status?: {
    service: string;
    method: string;
    query_parameters?: unknown;
    completeStatusIdentifier: string;
    pendingStatusIdentifier: string;
    suspendedStatusIdentifier: string;
    abortStatusIdentifier?: string;
  };
  results?: {
    service: string;
    method: string;
    query_parameters?: unknown;
    fileName?: string;
    type: string;
  };
}

