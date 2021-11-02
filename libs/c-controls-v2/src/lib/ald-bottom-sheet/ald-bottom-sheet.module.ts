import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { AldBottomSheetComponent } from './ald-bottom-sheet.component';
import { AlCommonComponentsModule } from './../common-components.module';
import { AldStepComponent } from './ald-step/ald-step.component';

@NgModule({
    imports: [
        CommonModule,
        AlCommonComponentsModule
    ],
    declarations: [
        AldBottomSheetComponent,
        AldStepComponent
    ],
    exports: [
        AldBottomSheetComponent,
        AldStepComponent
    ]
})
export class AldBottomSheetModule {}