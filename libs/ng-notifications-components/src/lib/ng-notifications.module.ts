import { NgCardstackModule } from '@al/ng-cardstack-components';
import {
    AlOrdinalNumberPipe,
    NgGenericComponentsModule,
} from '@al/ng-generic-components';
import {
    NgNavigationModule,
} from '@al/ng-navigation-components';
import {
    CommonModule,
    TitleCasePipe,
} from '@angular/common';
import { NgModule } from '@angular/core';
import {
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import { MonacoEditorModule, MONACO_PATH } from '@materia-ui/ngx-monaco-editor';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SlideMenuModule } from 'primeng/slidemenu';
import { ChipsModule } from 'primeng/chips';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TooltipModule } from 'primeng/tooltip';
import { MultiSelectModule } from 'primeng/multiselect';
import * as components from './components';
import { AlBlobService } from './services/al-blob-service';
import { InputNumberModule } from 'primeng/inputnumber';

@NgModule({
    declarations: [
        ...components.NOTIFICATIONS_COMPONENTS,
    ],
    imports: [
        CommonModule,
        CalendarModule,
        CheckboxModule,
        ConfirmDialogModule,
        DropdownModule,
        FormsModule,
        InputSwitchModule,
        InputTextModule,
        NgCardstackModule,
        NgGenericComponentsModule,
        NgNavigationModule,
        PanelModule,
        RadioButtonModule,
        ProgressSpinnerModule,
        ReactiveFormsModule,
        SlideMenuModule,
        ChipsModule,
        AutoCompleteModule,
        TooltipModule,
        MultiSelectModule,
        MonacoEditorModule,
        InputNumberModule
    ],
    exports: [
        ...components.NOTIFICATIONS_COMPONENTS,
    ],
    providers: [
        TitleCasePipe,
        AlOrdinalNumberPipe,
        AlBlobService,
        {
            provide: MONACO_PATH,
            useValue: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.21.2/min/vs'
        }
    ]
})
export class NgNotificationsModule {
}
