import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AlCommonComponentsModule } from './../common-components.module';

import { AlCheckboxComponent } from './al-checkbox/al-checkbox.component';
import { AlCheckboxGroupComponent } from './al-checkbox-group/al-checkbox-group.component';
import { AlFieldsetComponent } from './al-fieldset/al-fieldset.component';
import { AlFormGroupComponent } from './al-form-group/al-form-group.component';
import { AlFormGroupErrorsComponent } from './al-form-group-errors/al-form-group-errors.component';
import { AlHintComponent } from './al-hint/al-hint.component';
import { AlInputComponent } from './al-input/al-input.component';
import { AlLabelComponent } from './al-label/al-label.component';
import { AlMultiselectComponent } from './al-multiselect/al-multiselect.component';
import { AlRadioComponent } from './al-radio/al-radio.component';
import { AlSelectComponent } from './al-select/al-select.component';
import { AlTipComponent } from './al-tip/al-tip.component';
import { AlTextareaComponent } from './al-textarea/al-textarea.component';
import { AlTreeViewComponent } from './al-tree-view/al-tree-view.component';
import { AlTreeViewItemComponent } from './al-tree-view/al-tree-view-item/al-tree-view-item.component';


@NgModule({
    imports: [
        AlCommonComponentsModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule
    ],
    declarations: [
        AlCheckboxComponent,
        AlCheckboxGroupComponent,
        AlFieldsetComponent,
        AlFormGroupComponent,
        AlFormGroupErrorsComponent,
        AlHintComponent,
        AlInputComponent,
        AlLabelComponent,
        AlMultiselectComponent,
        AlRadioComponent,
        AlSelectComponent,
        AlTextareaComponent,
        AlTipComponent,
        AlTreeViewComponent,
        AlTreeViewItemComponent
    ],
    exports: [
        AlCheckboxComponent,
        AlCheckboxGroupComponent,
        AlFieldsetComponent,
        AlFormGroupComponent,
        AlFormGroupErrorsComponent,
        AlHintComponent,
        AlInputComponent,
        AlLabelComponent,
        AlMultiselectComponent,
        AlRadioComponent,
        AlSelectComponent,
        AlTextareaComponent,
        AlTipComponent,
        AlTreeViewComponent,
        AlTreeViewItemComponent
    ]
})
export class AlFormsModule {}
