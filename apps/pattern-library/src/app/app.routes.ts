import { Routes } from '@angular/router';
import {
    AlertBoxesComponent,
    AlOverlayExamplesComponent,
    AssetExamplesComponent,
    ButtonsComponent,
    ColoursComponent,
    ColourPalettesComponent,
    ConfigPageHeaderComponent,
    DashboardExamplesComponent,
    DataExamplesComponent,
    DetailsPageHeaderComponent,
    DownloadQueueComponent,
    FabHeaderComponent,
    FormExamplesComponent,
    GenericComponentExamplesComponent,
    HighChartsComponent,
    HomeComponent,
    IconsComponent,
    LoadingIndicatorsComponent,
    LoginPageComponent,
    MenuExamplesComponent,
    MessageExamplesComponent,
    NotificationExamplesComponent,
    NotificationsComponentExamplesComponent,
    /*
    OverlayExamplesComponent,
    */
    PanelExamplesComponent,
    ProtectedContentTestComponent,
    TableChartsComponent,
    TypographyComponent,
    UtilitiesComponent,
    ComplexSelectorsComponent,
    DatePickersComponent,
    ZeroStateComponent,
    PageHeadersComponent,
    CardstackComponent,
    ProgressIndicatorsComponent,
    SearchControlsComponent,
    TabControlsComponent,
    ButtonGroupsComponent,
    CardButtonsComponent,
    IconButtonsComponent,
    SplitDropdownComponent,
    CardsDefaultComponent,
    CardsAimsComponent,
    CardsDashboardWidgetsComponent,
    CardsDeploymentsComponent,
    CardsReportsComponent,
    CardsSearchResultsComponent,
	FormsCheckboxComponent,
    FormsChipsComponent,
    FormsDropdownComponent,
    InputsTextareasComponent,
    FormsRadioButtonsComponent,
    FormsSliderComponent,
    FormsSwitchComponent,
    FormsWizardStepperComponent,
    ListsAuditLogComponent,
    ListsEvidenceTimelineComponent,
    ListsScanDisputesComponent,
    ListsTableComponent,
    OverlaysBottomSheetsComponent,
    OverlaysDialogBoxComponent,
    /*
    OverlaysCarouselComponent,
    */
    OverlaysSnackbarSelectActionComponent,
    OverlaysToastComponent,
    OverlaysTooltipsComponent,
    /*
    TopologyConfigComponent,
    TopologyIncidentComponent,
    TopologyConsoleComponent,
    */
    SearchLogComponent,
    VisualizationsExposuresComponent,
    VisualizationsHealthComponent,
    VisualizationsIncidentsComponent,
    VisualizationsTriComponent,
	AlFilterExampleComponent,
	FilterComponent,
    SidebarComponent,
    WelcomeDialogComponent,
    DynamicTableComponent,
    PanelsComponent,
    CollapsibleLayoutComponent,
    PreviewComponent,
    TableCaptionComponent

/* COMPONENT_CLASS */
} from './components';
import { ALNAV_PUBLIC } from '@al/ng-navigation-components';
import { FormsDynamicComponent } from './components/forms-dynamic/forms-dynamic.component';
/*
import { AlInputExamplesComponent } from './new-pattern-library/al-inputs/al-input-examples.component'
import { AlUtilitiesComponent } from './new-pattern-library/utilities/utilities.component';
import { AlButtonExamplesComponent } from './new-pattern-library/al-buttons/al-button-examples.component';
*/
/*
import { FormsScheduleTimeWithDelayComponent } from './components/forms-schedule-time-with-delay/forms-schedule-time-with-delay.component';
*/

export const applicationRoutes: Routes = [
    {
        path: '',
        component: HomeComponent,
        data: {
            alNavigation: [ ALNAV_PUBLIC ]
        }
    },
    {
        path: 'login',
        component: LoginPageComponent,
        data: {
            alNavigation: [ ALNAV_PUBLIC ]
        }
    },
    {
        path: 'patterns',

        children: [
            {
                path: 'global',
                children: [
                    {
                        path: 'colors',
                        component: ColoursComponent
                    },
                    {
                        path: 'palette',
                        component: ColourPalettesComponent
                    },
                    {
                        path: 'typography',
                        component: TypographyComponent
                    },
                    {
                        path: 'icons',
                        component: IconsComponent
                    },
                    {
                        path: 'panels',
                        component: PanelsComponent
                    },
                    {
                        path: 'alert-boxes',
                        component: AlertBoxesComponent
                    },
                    {
                        path: 'collapsible-layout',
                        component: CollapsibleLayoutComponent
                    },
                    {
                        path: 'loading-indicators',
                        component: LoadingIndicatorsComponent
                    },
                    {
                        path: 'progress-indicators',
                        component: ProgressIndicatorsComponent
                    },
                    {
                        path: 'tabs',
                        component: TabControlsComponent
                    },
                    {
                        path: 'zero-states',
                        component: ZeroStateComponent
                    },
					{
                        path: 'filter',
                        component: FilterComponent
                    }
                ]
            },
            {
                path: 'buttons',
                children: [
                    {
                        path: 'global-buttons',
                        component: ButtonsComponent
                    },
                    {
                        path: 'button-groups',
                        component: ButtonGroupsComponent
                    },
                    {
                        path: 'card-buttons',
                        component: CardButtonsComponent
                    },
                    {
                        path: 'icon-buttons',
                        component: IconButtonsComponent
                    },
                    {
                        path: 'split-dropdown',
                        component: SplitDropdownComponent
                    }
                ]
            },
            {
                path: 'cards',
                children: [
                    {
                        path: 'base-card',
                        component: CardsDefaultComponent
                    },
                    {
                        path: 'aims',
                        component: CardsAimsComponent
                    },
                    {
                        path: 'asset-card-examples',
                        component: AssetExamplesComponent
                    },
                    {
                        path: 'dashboard-widget',
                        component: CardsDashboardWidgetsComponent
                    },
                    {
                        path: 'deployment',
                        component: CardsDeploymentsComponent
                    },
                    {
                        path: 'reports',
                        component: CardsReportsComponent
                    },
                    {
                        path: 'search-results',
                        component: CardsSearchResultsComponent
                    }
                ]
            },
            {
                path: 'cardstack',
                children: [
                    {
                        path: 'filters',
                        component: AlFilterExampleComponent
                    },
                ]
            },
            {
                path: 'form',
                children: [
					{
                        path: 'check-box',
                        component: FormsCheckboxComponent
                    },
                    {
                        path: 'chips',
                        component: FormsChipsComponent
                    },
                    {
                        path: 'complex-selectors',
                        component: ComplexSelectorsComponent
                    },
                    {
                        path: 'date-pickers',
                        component: DatePickersComponent
                    },
                    {
                        path: 'dropdowns',
                        component: FormsDropdownComponent
                    },
                    {
                        path: 'dynamic',
                        component: FormsDynamicComponent
                    },
                    {
                        path: 'inputs-textareas',
                        component: InputsTextareasComponent
                    },
                    {
                        path: 'radio-buttons',
                        component: FormsRadioButtonsComponent
                    },
                    {
                        path: 'sliders',
                        component: FormsSliderComponent
                    },
                    {
                        path: 'switch',
                        component: FormsSwitchComponent
                    },
                    {
                        path: 'wizzard-stepper',
                        component: FormsWizardStepperComponent
                    },
                    /*
                    {
                        path: 'schedule-time-with-delay',
                        component: FormsScheduleTimeWithDelayComponent
                    }
                    */
                ]
            },
            {
                path: 'lists',
                children: [
                    {
                        path: 'audit-log',
                        component: ListsAuditLogComponent
                    },
                    {
                        path: 'evidence-timeline',
                        component: ListsEvidenceTimelineComponent
                    },
                    {
                        path: 'scan-disputes',
                        component: ListsScanDisputesComponent
                    }
                ]
            },
            {
                path: 'overlays',
                children: [
                    {
                        path: 'bottom-sheets',
                        component: OverlaysBottomSheetsComponent
                    },
                    {
                        path: 'dialog-box',
                        component: OverlaysDialogBoxComponent
                    },
                    {
                        path: 'download-queue',
                        component: DownloadQueueComponent
                    },
                    {
                        path: 'drawers',
                        component: SidebarComponent
                    },
                    {
                        path: 'notification-examples',
                        component: NotificationExamplesComponent
                    },
                    /*
                    {
                        path: 'onboarding',
                        component: OverlaysCarouselComponent
                    },
                    */
                    {
                        path: 'action-snackbar',
                        component: OverlaysSnackbarSelectActionComponent
                    },
                    {
                        path: 'preview',
                        component: PreviewComponent
                    },
                    {
                        path: 'toast',
                        component: OverlaysToastComponent
                    },
                    {
                        path: 'tooltips',
                        component: OverlaysTooltipsComponent
                    },
                    {
                        path: 'welcome-dialog',
                        component: WelcomeDialogComponent
                    }
                ]
            },
            {
                path: 'headers',
                children: [
                    {
                        path: 'default',
                        component: PageHeadersComponent
                    },
                    {
                        path: 'fab-header',
                        component: FabHeaderComponent
                    },
                    {
                        path: 'details-page-header',
                        component: DetailsPageHeaderComponent
                    },
                    {
                        path: 'configuration-header',
                        component: ConfigPageHeaderComponent
                    }
                ]
            },
            {
                path: 'searches',
                children: [
                    {
                        path: 'page-search',
                        component: SearchControlsComponent
                    },
                    {
                        path: 'search-log',
                        component: SearchLogComponent
                    }
                ]
            },
            {
                path: 'tables',
                children: [
                    {
                        path: 'tables',
                        component: ListsTableComponent
                    },
                    {
                        path: 'dynamic-table',
                        component: DynamicTableComponent
                    },
                    {
                        path: 'table-caption',
                        component: TableCaptionComponent
                    }
                ]
            },
            /*
            {
                path: 'topology',
                children: [
                    {
                        path: 'topology-config',
                        component: TopologyConfigComponent
                    },
                    {
                        path: 'topology-incident',
                        component: TopologyIncidentComponent
                    },
                    {
                        path: 'topology-console',
                        component: TopologyConsoleComponent
                    }
                ]
            },
            */
            {
                path: 'visualizations',
                children: [
                    {
                        path: 'exposures',
                        component: VisualizationsExposuresComponent
                    },
                    {
                        path: 'health',
                        component: VisualizationsHealthComponent
                    },
                    {
                        path: 'incidents',
                        component: VisualizationsIncidentsComponent
                    },
                    {
                        path: 'tri',
                        component: VisualizationsTriComponent
                    }
                ]
            },
            {
                path: 'common-elements',
                children: [
                    {
                        path: 'cardstack-1',
                        component: CardstackComponent
                    },
                    {
                        path: 'cardstack-1/:accountId',
                        component: CardstackComponent
                    }
                ]
            },
            {
                path: 'primeng',
                children: [
                    {
                        path: 'data-examples',
                        component: DataExamplesComponent
                    },
                    {
                        path: 'form-examples',
                        component: FormExamplesComponent
                    },
                    {
                        path: 'message-examples',
                        component: MessageExamplesComponent
                    },
                    /*
                    {
                        path: 'overlay-examples',
                        component: OverlayExamplesComponent
                    },
                    */
                    {
                        path: 'panel-examples',
                        component: PanelExamplesComponent
                    },
                    {
                        path: 'utilities',
                        component: UtilitiesComponent
                    }
                ]
            },
            /*
            {
                path: 'new-pattern-library',
                children: [
                    {
                        path: 'al-inputs',
                        component: AlInputExamplesComponent
                    },
                    {
                        path: 'buttons',
                        component: AlButtonExamplesComponent
                    },
                    {
                      path: 'utilities',
                      component: AlUtilitiesComponent
                    }
                ]
            }
            */
        ]
    },
    {
        path: 'deprecated/colour-palettes',
        component: ColourPalettesComponent
    },
    {
        path: 'deprecated/form-examples',
        component: FormExamplesComponent
    },
    {
        path: 'deprecated/data-examples',
        component: DataExamplesComponent
    },
    /*
    {
        path: 'deprecated/overlay-examples',
        component: OverlayExamplesComponent
    },
    */
    {
        path: 'deprecated/panel-examples',
        component: PanelExamplesComponent
    },
    {
        path: 'deprecated/menu-examples',
        component: MenuExamplesComponent
    },
    {
        path: 'deprecated/messages',
        component: MessageExamplesComponent
    },
    {
        path: 'deprecated/utilities',
        component: UtilitiesComponent
    },
    {
        path: 'deprecated/typography',
        component: TypographyComponent
    },
    {
        path: 'deprecated/typography/:category',
        component: TypographyComponent
    },
    {
        path: 'protected-content',
        component: ProtectedContentTestComponent
    },
    {
        path: 'dashboards',
        children:[
            {
                path: 'highcharts',
                component: HighChartsComponent
            },
            {
                path: 'table-charts',
                component: TableChartsComponent
            },
            {
                path: 'dashboard-examples',
                component: DashboardExamplesComponent
            }
        ]
    },
    /*
    {
        path: 'al-overlay-examples',
        component: AlOverlayExamplesComponent
    },
    */
    {
        path: 'generic-component-examples',
        component: GenericComponentExamplesComponent
    },
    {
        path: 'notifications-component-examples',
        component: NotificationsComponentExamplesComponent
    },
];
