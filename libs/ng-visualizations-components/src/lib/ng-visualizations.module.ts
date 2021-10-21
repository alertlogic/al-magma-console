import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

import * as components from './components';
import { AlHighChartsUtilityService } from './services/al-highcharts-utility-service';
import { NgGenericComponentsModule } from '@al/ng-generic-components';
import { NgSelectModule } from '@ng-select/ng-select';
import { AlVisualizationElementDictionary } from './services/al-visualization-element-dictionary';

@NgModule({
    declarations: [
      ...components.VISUALIZATIONS_COMPONENTS
    ],
    imports: [
        CommonModule,
        NgGenericComponentsModule,
        NgSelectModule,
        HttpClientModule,
        ButtonModule,
        OverlayPanelModule,
        PanelModule,
        TableModule,
        TooltipModule,
        FormsModule
    ],
    exports: [
        ...components.VISUALIZATIONS_COMPONENTS,
    ],
    providers: [
        AlVisualizationElementDictionary,
        AlHighChartsUtilityService
    ]
})
export class NgVisualizationModule {
}
