import {
    NgGenericComponentsModule,
} from '@al/ng-generic-components';
import {
    NgCardstackModule,
} from '@al/ng-cardstack-components';
import {
    CommonModule,
} from '@angular/common';
import { NgModule } from '@angular/core';
import * as components from './components';
import { ErrorService } from './services/error.service';
import { ExposureUtilityService } from './services/exposure-utility.service';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
    declarations: [
        ...components.ASSET_COMPONENTS,
    ],
    imports: [
        CommonModule,
        NgCardstackModule,
        NgGenericComponentsModule,
        FormsModule,
        DropdownModule,
        RadioButtonModule,
        InputTextModule,
        InputTextareaModule,
        OverlayPanelModule,
        CheckboxModule,
        TooltipModule
    ],
    exports: [
        ...components.ASSET_COMPONENTS,
    ],
    providers: [
        ErrorService,
        ExposureUtilityService
    ]
})
export class NgAssetModule {
}
