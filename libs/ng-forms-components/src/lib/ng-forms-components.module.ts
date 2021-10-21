import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TooltipModule } from 'primeng/tooltip';
import { MonacoEditorModule, MONACO_PATH } from '@materia-ui/ngx-monaco-editor';
import { AlDynamicFormUtilityService } from './services/al-dynamic-form-utility.service';
import * as components from './components';
import { NgGenericComponentsModule } from '@al/ng-generic-components';
import { MarkdownModule } from 'ngx-markdown';
import { CalendarModule } from "primeng/calendar";
import { MultiSelectModule } from "primeng/multiselect";
import { SelectButtonModule } from "primeng/selectbutton";
import { TabViewModule } from "primeng/tabview";

@NgModule({
  declarations: [
    ...components.ALL_COMMON
  ],
  imports: [
    ButtonModule,
    CheckboxModule,
    CommonModule,
    DropdownModule,
    FormsModule,
    InputTextModule,
    InputTextareaModule,
    InputSwitchModule,
    MonacoEditorModule,
    NgGenericComponentsModule,
    ReactiveFormsModule,
    RadioButtonModule,
    TooltipModule,
    MarkdownModule.forRoot(),
    MultiSelectModule,
    CalendarModule,
    SelectButtonModule,
    TabViewModule,
  ],
  exports: [
    ...components.ALL_COMMON
  ],
  providers: [
    AlDynamicFormUtilityService,
    {
        provide: MONACO_PATH,
        useValue: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.21.2/min/vs'
    }
]
})
export class NgFormsComponentsModule {
}
