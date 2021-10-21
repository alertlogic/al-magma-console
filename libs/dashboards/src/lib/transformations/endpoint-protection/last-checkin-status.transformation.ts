import { Widget as WidgetConfig } from '@al/ng-visualizations-components';
import { AlEndpointsSummaryData } from '@al/endpoints';

interface SummaryResponse {
  summary: AlEndpointsSummaryData;
}

export const lastCheckinStatus = (response: SummaryResponse, item?: WidgetConfig) => {
  const over30Days: number = response.summary.checkinBreakdown.notRecently || 0;
  const over60Mins: number = response.summary.checkinBreakdown.recent || 0;
  const within60Mins: number = response.summary.checkinBreakdown.online || 0;

  return {
    title: "",
    yAxisType: "linear",
    dateOptions: ["Over 30 days", "Over 60 mins", "Within 60 mins"],
    series: [{
      name: "",
      showInLegend: false,
      data: [{
        name: "Over 30 days",
        y: over30Days,
        className: "critical",
        recordLink: {
          filter: "OVER_30_DAYS"
        }
      }, {
        name: "Over 60 mins",
        y: over60Mins,
        className: "medium",
        recordLink: {
          filter: "OVER_60_MINUTES"
        }
      }, {
        name: "Within 60 mins",
        y: within60Mins,
        className: "low",
        recordLink: {
          filter: "WITHIN_60_MINUTES"
        }
      }]
    }]
  };
};
