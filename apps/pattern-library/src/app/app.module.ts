import { NgAssetModule } from '@al/ng-asset-components';
import { NgCardstackModule } from '@al/ng-cardstack-components';
import { NgGenericComponentsModule } from '@al/ng-generic-components';
import { NgFormsComponentsModule } from '@al/ng-forms-components';
import { NgNavigationModule } from '@al/ng-navigation-components';
import { NgNotificationsModule } from '@al/ng-notifications-components';
import { NgVisualizationModule } from '@al/ng-visualizations-components';

import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ChartModule, HIGHCHARTS_MODULES } from 'angular-highcharts';

import * as tree from 'highcharts/modules/treemap.src';
import { MarkdownModule } from 'ngx-markdown';
import { MonacoEditorModule, MONACO_PATH } from '@materia-ui/ngx-monaco-editor';

import { AccordionModule } from 'primeng/accordion';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { CarouselModule } from 'primeng/carousel';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipsModule } from 'primeng/chips';
import { CodeHighlighterModule } from 'primeng/codehighlighter';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DataViewModule } from 'primeng/dataview';
import { DialogModule } from 'primeng/dialog';
import { DragDropModule } from 'primeng/dragdrop';
import { DropdownModule } from 'primeng/dropdown';
import { FieldsetModule } from 'primeng/fieldset';
import { InputSwitchModule } from 'primeng/inputswitch';
import { LightboxModule } from 'primeng/lightbox';
import { ListboxModule } from 'primeng/listbox';
import { MegaMenuModule } from 'primeng/megamenu';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { MultiSelectModule } from 'primeng/multiselect';
import { OrderListModule } from 'primeng/orderlist';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PanelModule } from 'primeng/panel';
import { PanelMenuModule } from 'primeng/panelmenu';
import { PickListModule } from 'primeng/picklist';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule} from 'primeng/tooltip';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SidebarModule } from 'primeng/sidebar';
import { SlideMenuModule } from 'primeng/slidemenu';
import { SliderModule } from 'primeng/slider';
import { SpinnerModule } from 'primeng/spinner';
import { SplitButtonModule } from 'primeng/splitbutton';
import { StepsModule } from 'primeng/steps';
import { TableModule } from 'primeng/table';
import { TabMenuModule } from 'primeng/tabmenu';
import { TabViewModule } from 'primeng/tabview';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { ToastModule } from 'primeng/toast';
import { TreeModule } from 'primeng/tree';
import { TreeTableModule } from 'primeng/treetable';
import { VirtualScrollerModule } from 'primeng/virtualscroller';

import { AppComponent } from './app.component';

import { applicationRoutes } from './app.routes';

import { CodeHighlighterDirective } from './pcode.directive';
import { USAGE_GUIDE_COMPONENTS } from './components';
import { PLAYGROUND_COMPONENTS } from './playground/components';
import { CarService } from './service/carservice';
import { CountryService } from './service/countryservice';
import { EventService } from './service/eventservice';
import { NodeService } from './service/nodeservice';
import { AppResourcesService } from './service/app-resources.service';
/*
import { AutomatedResponseComponent } from './playground/automated-response/automated-response.component';
import { BottomSheetExampleComponent } from './playground/bottom-sheet-example/bottom-sheet-example.component';
*/

import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
    declarations: [
        AppComponent,
        CodeHighlighterDirective,
        ...USAGE_GUIDE_COMPONENTS,
        ...PLAYGROUND_COMPONENTS
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        RouterModule.forRoot( applicationRoutes, { useHash: true, relativeLinkResolution: 'legacy' }),

        AccordionModule,
        AutoCompleteModule,
        BreadcrumbModule,
        BrowserAnimationsModule,
        BrowserModule,
        ButtonModule,
        CalendarModule,
        CardModule,
        CarouselModule,
        ChartModule,
        CheckboxModule,
        ChipsModule,
        CodeHighlighterModule,
        ConfirmDialogModule,
        ContextMenuModule,
        DataViewModule,
        DialogModule,
        DragDropModule,
        DropdownModule,
        FieldsetModule,
        InputSwitchModule,
        LightboxModule,
        ListboxModule,
        MegaMenuModule,
        MenubarModule,
        MenuModule,
        MessageModule,
        MessagesModule,
        MultiSelectModule,
        OrderListModule,
        OrganizationChartModule,
        OverlayPanelModule,
        PanelMenuModule,
        PanelModule,
        PickListModule,
        ProgressBarModule,
        RadioButtonModule,
        MonacoEditorModule,
        ScrollPanelModule,
        SelectButtonModule,
        SidebarModule,
        SlideMenuModule,
        SliderModule,
        SpinnerModule,
        SplitButtonModule,
        StepsModule,
        TableModule,
        TabMenuModule,
        TabViewModule,
        TieredMenuModule,
        ToastModule,
        ToolbarModule,
        TooltipModule,
        TreeModule,
        TreeTableModule,
        VirtualScrollerModule,

        MarkdownModule.forRoot(),

        NgAssetModule,
        NgCardstackModule,
        NgFormsComponentsModule,
        NgGenericComponentsModule,
        NgNavigationModule,
        NgNotificationsModule,
        NgVisualizationModule
    ],
    providers: [
        { provide: HIGHCHARTS_MODULES, useFactory: () => [tree] },
        CarService, CountryService, EventService, NodeService, AppResourcesService,
        {
            provide: MONACO_PATH,
            useValue: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.21.2/min/vs'
        } 
    ],
    bootstrap: [AppComponent]
})
export class AppModule {

}
