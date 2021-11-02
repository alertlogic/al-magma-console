import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatternLibModule } from './pattern-lib.module';

@NgModule({
  imports: [
      CommonModule,
      PatternLibModule,
  ],
  exports: [ PatternLibModule ],
})
export class ControlsV2ComponentsModule {}
