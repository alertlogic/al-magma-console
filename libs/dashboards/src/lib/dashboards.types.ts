export type ContactCountryCode = "uk" | "us";

export interface ContactNumbers {
  current: ContactCountryCode;
  uk: string;
  us: string;
}

export interface DashboardConfigBase {
  id: string;
  name: string;
  refreshRate?: number;
  layoutFormat?: string;
  uniqueRef?: string;
  tags?: string[];
}

export interface DataSourceArgs {
  body?: any;
  query_parameters?: {[key: string]: any};
  urlTail?: string;
}

export interface SourceConfigDataSource {
  service: string;
  method: string;
  args?: DataSourceArgs;
  mock?: any;
}

export interface SourceConfig {
  id: string;
  name: string;
  dataSources: SourceConfigDataSource[];
  accountId?: string;
}

export interface DashboardFilterValue {
  id: string;
  name: string;
  code: number;
  uniqueRef?: string;
}

export interface DashboardFilter {
  label: string;
  icon: string;
  value: DashboardFilterValue;
  subtext?: string;
  displayOrder?: number;
}

export interface SelectDashboardEvent {
  code: number;
  id: string;
  name: string;
}

export interface DashboardFilters {
  start_date_time: number;
  end_date_time: number;
  start_date_time_eod?: number;
  end_date_time_sod?: number;
}

export interface DashboardDisplayPreferences {
  last_visible_dashboard_id?: string;
  dark_mode_enabled?: boolean;
}

export interface AccountCount {
  accountId: string;
  accountName: string;
  count: number;
}

export interface PartnerHealthOverallCounts {
  network_status: number;
  missing_agent: number;
  configuration_remediation: number;
  appliance_status: number;
  agent_status: number;
}

export interface PartnerHealthCountBreakdowns {
  network_status: {
    Unhealthy?: number;
    Healthy?: number;
  };
  missing_agent: {
    Missing: number;
  };
  configuration_remediation: {
    Open: number;
  };
  appliance_status: {
    Unhealthy?: number;
    Healthy?: number;
  };
  agent_status: {
    Unhealthy?: number;
    Healthy?: number;
  };
}

export const threatRatingLevels = {
  Info: 0,
  Low: 1,
  Medium: 2,
  High: 3,
  Critical: 4
};

export const isAuthenticationIncident = (incidentType: string) => ["admin:activity", "authentication:activity"].includes(incidentType);
