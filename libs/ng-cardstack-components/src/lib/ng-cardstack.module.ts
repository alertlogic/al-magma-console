import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AccordionModule } from 'primeng/accordion';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { PanelModule } from 'primeng/panel';
import { TabMenuModule } from 'primeng/tabmenu';
import { ChipsModule } from 'primeng/chips';


import { NgGenericComponentsModule } from '@al/ng-generic-components';
import { NgNavigationModule } from '@al/ng-navigation-components';

import * as components from './components';


@NgModule({
    declarations: [
      ...components.CARDSTACK_COMPONENTS,
    ],
    imports: [
        CommonModule,
        FormsModule,
        NgGenericComponentsModule,
        NgNavigationModule,
        ReactiveFormsModule,
        ButtonModule,
        CardModule,
        AccordionModule,
        CalendarModule,
        CheckboxModule,
        DropdownModule,
        PanelModule,
        TabMenuModule,
        ChipsModule,
    ],
    exports: [
        ...components.CARDSTACK_COMPONENTS,
    ]
})
export class NgCardstackModule {
}
