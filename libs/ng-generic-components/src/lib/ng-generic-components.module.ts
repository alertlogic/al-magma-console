import { AlFileDownloadService } from './services/al-file-download-service';
import { AlExternalContentManagerService } from './services/al-external-content-manager.service';
import { AlToastService } from './services/al-toast.service';
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipsModule } from 'primeng/chips';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';
import { ListboxModule } from 'primeng/listbox';
import { MenuModule } from 'primeng/menu';
import { MultiSelectModule } from 'primeng/multiselect';
import { PanelModule } from 'primeng/panel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SidebarModule } from 'primeng/sidebar';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { InputSwitchModule } from 'primeng/inputswitch';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { AccordionModule } from 'primeng/accordion';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { SelectButtonModule } from 'primeng/selectbutton';
import { GalleriaModule } from 'primeng/galleria';
import { InputNumberModule } from 'primeng/inputnumber';

import * as components from './components';
import { AlFilter2Component } from './al-filter2/al-filter2.component';
import * as newComponents from './new-components/components';
import { DecodesPipe } from './pipes';
import { Decode64Service, HighlightTextService, ChromaHash, HtmlViewService } from './services';


@NgModule({
    declarations: [
        ...components.ALL_COMMON,
        ...newComponents.ALL_NEW_COMMON,
        AlFilter2Component
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ButtonModule,
        CheckboxModule,
        ChipsModule,
        DialogModule,
        DropdownModule,
        InputTextModule,
        InputTextareaModule,
        ListboxModule,
        MenuModule,
        MultiSelectModule,
        PanelModule,
        OverlayPanelModule,
        SidebarModule,
        TableModule,
        ToastModule,
        ToolbarModule,
        TooltipModule,
        CalendarModule,
        ProgressSpinnerModule,
        RadioButtonModule,
        InputSwitchModule,
        AccordionModule,
        SelectButtonModule,
        AutoCompleteModule,
        GalleriaModule,
        InputNumberModule,
    ],
    exports: [
        ...components.ALL_COMMON,
        ...newComponents.ALL_NEW_COMMON
    ],
    providers: [
        AlExternalContentManagerService,
        AlToastService,
        AlFileDownloadService,
        DatePipe,
        DecodesPipe,
        Decode64Service,
        HighlightTextService,
        ChromaHash,
        HtmlViewService
    ]
})
export class NgGenericComponentsModule { }
