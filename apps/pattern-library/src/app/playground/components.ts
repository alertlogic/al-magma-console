/**
 * chore(kjn): fix the types in TopologyTableComponent and SearchConsoleComponent so that it is less screwed up
 */
import { Route } from '@angular/router';
import { MerryGoRoundComponent } from './merry-go-round/merry-go-round.component';
import { SearchConsoleComponent } from './search-console/search-console.component';
import { TableViewComponent } from './tableview/tableview.component';
import { DataViewComponent } from './dataview/dataview.component';
import { CardListViewComponent } from './card-list-view/card-list-view.component';
import { HealthConsoleComponent } from './health-console/health-console.component';
import { TopologyTableComponent } from './topology-table/topology-table.component';
import { BottomSheetExampleComponent } from './bottom-sheet-example/bottom-sheet-example.component';
import { AutomatedResponseComponent } from './automated-response/automated-response.component';
import { MarkdownPreviewerComponent } from './markdown-previewer/markdown-previewer.component';
/* Import your components here */

const PLAYGROUND_COMPONENTS = [
    MerryGoRoundComponent,
    SearchConsoleComponent,
    TableViewComponent,
    DataViewComponent,
    CardListViewComponent,
    HealthConsoleComponent,
    TopologyTableComponent,
    BottomSheetExampleComponent,
    AutomatedResponseComponent,
    MarkdownPreviewerComponent,
    /* Add your components here */
];

const PLAYGROUND_ROUTES:Route[] = [
    {
        path: 'playground/merry-go-round',
        component: MerryGoRoundComponent
    },
    {
        path: 'playground/search-console',
        component: SearchConsoleComponent
    },
    {
        path: 'playground/tableview',
        component: TableViewComponent
    },
    {
        path: 'playground/dataview',
        component: DataViewComponent
    },
    {
        path: 'playground/card-list-view',
        component: CardListViewComponent
    },
    {
        path: 'playground/health-console',
        component: HealthConsoleComponent
    },
    {
        path: 'playground/asset-groups',
        component: TopologyTableComponent
    },
    {
        path: 'playground/manual-incident',
        component: BottomSheetExampleComponent
    },
    {
        path: 'playground/automated-response',
        component: AutomatedResponseComponent
    },
    {
        path: 'playground/markdown-previewer',
        component: MarkdownPreviewerComponent
    } 
];

export {
    PLAYGROUND_COMPONENTS,
    PLAYGROUND_ROUTES,
    MerryGoRoundComponent,
    SearchConsoleComponent,
    TableViewComponent,
    DataViewComponent,
    CardListViewComponent,
    HealthConsoleComponent,
    TopologyTableComponent,
    AutomatedResponseComponent,
    MarkdownPreviewerComponent
    /* Export your components here */
}
