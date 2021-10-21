/**
 * List of custom event names to be used when capturing any required usage metrics across our consoles
 */
export enum AlTrackingMetricEventName {

    UsageTrackingEvent = 'ui.usagetrackingevent'
}

/**
 * Consistent event categories to be used across our applications for sending usage metrics to our analytics provider - Google Analytics currently
 * Please update this list with any further categories and use accordingly rather than supplying raw names to our
 * AlNavigationService.track(...) and AlGooglTagManagerService.trackCustomEvent(...) implementations...
 */
export enum AlTrackingMetricEventCategory {

    // General Purpose Categories
    GenericConsoleAction = 'Generic Console Action',
    GenericConsoleException = 'Generic Console Exception',
    // Dashboards
    DashboardAction = 'Dashboard Action',
    DashboardWidgetAction = 'Dashboard Widget Action',
    // Health
    HealthAction = 'Health Action',
    // Exposures
    ExposuresAction = 'Exposures Action',
    // Incidents
    IncidentsAction = 'Incidents Action',
    // Configuration
    ConfigurationAction = 'Configuration Action',
    // Overview
    OverviewAction = 'Overview Action',
    // Search
    SearchAction = 'Search Action',
    // Endpoints
    EndpointsAction = 'Endpoints Action',
    // Vulnerability Library
    VulnerabilityLibraryAction = 'Vulnerability Library Action',
    // Accounts
    AccountsAction = 'Accounts Action',
    PlaybooksAction = 'Playbooks Action',
    // Reports
    ReportsAction = 'Reports Action',
    // Events received from the javascript context of embedded defender views
    ExternalDatacenterAction = 'Legacy Defender Action',
    // Events reveived from aws market place signup page
    MarketplaceAction = 'Marketplace Action',
    // TIC
    TicAction = 'TIC Action',
}
