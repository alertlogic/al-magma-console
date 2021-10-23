import { NgModule } from '@angular/core';

import { AlCommonComponentsModule } from './common-components.module';
import { AlFormsModule } from './al-forms/al-forms.module';
import { AlTableModule } from './al-table/al-table.module';
import { AlThreatModule } from './al-threat/al-threat.module';
import { AldBottomSheetModule } from './ald-bottom-sheet/ald-bottom-sheet.module';

@NgModule({
  declarations: [

  ],
  imports: [
    AlCommonComponentsModule,
    AlFormsModule,
    AlTableModule,
    AlThreatModule,
    AldBottomSheetModule
  ],
  providers: [],
  exports: [
    AlCommonComponentsModule,
    AlFormsModule,
    AlTableModule,
    AlThreatModule,
    AldBottomSheetModule
  ]
})
export class PatternLibModule { }
