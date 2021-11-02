import { DragDropModule } from '@angular/cdk/drag-drop';
import { RouterModule } from '@angular/router';
import { CdkTableModule } from '@angular/cdk/table';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AlCommonComponentsModule } from '../common-components.module';
import { AlFormsModule } from '../al-forms/al-forms.module';
import { AlThreatModule } from '../al-threat/al-threat.module';

import { AlTableComponent } from './al-table.component';
import { AlTableCellTextComponent } from './table-cell-text/table-cell-text.component';
import { AlTableCellLinkComponent } from './table-cell-link/table-cell-link.component';
import { AlTableCellThreatComponent } from './table-cell-threat/table-cell-threat.component';
import { AlTableCellIconComponent } from './table-cell-icon/table-cell-icon.component';
import { AlTableCellBooleanComponent } from './table-cell-boolean/table-cell-boolean.component';
import { AlTableCellDateComponent } from './table-cell-date/table-cell-date.component';
import { AlTableCellIpAddressComponent } from './table-cell-ip-address/table-cell-ip-address.component';
import { AlTableHeaderComponent } from './table-header/table-header.component';


@NgModule({
    imports: [
        CommonModule,
        AlCommonComponentsModule,
        AlFormsModule,
        AlThreatModule,
        FormsModule,
        ReactiveFormsModule,
        CdkTableModule,
        DragDropModule,
        RouterModule
    ],
    declarations: [
        AlTableComponent,
        AlTableCellTextComponent,
        AlTableCellDateComponent,
        AlTableCellLinkComponent,
        AlTableCellThreatComponent,
        AlTableCellIconComponent,
        AlTableCellBooleanComponent,
        AlTableCellIpAddressComponent,
        AlTableHeaderComponent,
    ],
    exports: [
        AlTableComponent,
    ]
})
export class AlTableModule {}

