import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TechnicalDebtServices } from './services';
import { TechnicalDebtPipes } from './pipes';
import { TechnicalDebtComponents } from './components';
import { TechnicalDebtMaterialImports } from './angular-material.imports';

@NgModule({
  imports: [
      CommonModule,
      ...TechnicalDebtMaterialImports
  ],
  declarations: [
      ...TechnicalDebtComponents
  ],
  providers: [
      ...TechnicalDebtServices,
      ...TechnicalDebtPipes
  ]
})
export class UtilTechnicalDebtModule {}
