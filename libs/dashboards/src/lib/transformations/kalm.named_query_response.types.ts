export interface SeverityCountSummaries {
  rows?: ((string | ThreatLevelCountSummary | CountSummary))[][];
  column_info?: {type: string, name: string}[];
}

export interface ThreatLevelCountSummary {
  Critical?: number;
  High?: number;
  Medium?: number;
  Low?: number;
  Info?: number;
  None?: number;
}

export interface CountSummary {
  [key: string]: number;
}
