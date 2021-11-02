import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AlCommonComponentsModule } from './../common-components.module';
import { AlThreatSummaryComponent } from './al-threat-summary/al-threat-summary.component';
import { AlThreatRatingComponent } from './al-threat-rating/al-threat-rating.component';

@NgModule({
    imports: [
        AlCommonComponentsModule,
        CommonModule
    ],
    declarations: [
        AlThreatRatingComponent,
        AlThreatSummaryComponent
    ],
    exports: [
        AlThreatRatingComponent,
        AlThreatSummaryComponent
    ]
})
export class AlThreatModule {}
