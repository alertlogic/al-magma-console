import { NgGenericComponentsModule } from '@al/ng-generic-components';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ConfirmationService, MessageService } from 'primeng/api';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SidebarModule } from 'primeng/sidebar';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { InputSwitchModule } from 'primeng/inputswitch';

import * as components from './components';
import { TransformToMenu } from './pipes/transformToMenu.pipe';
import { AlUrlFilterService } from './services/al-url-filter.service';
import { AlGlobalErrorService } from './services/al-global-error.service';
import { AlEmbeddedUrlsService } from './services/al-embedded-urls.service';

@NgModule({
    declarations: [
        ...components.NAVIGATION_COMPONENTS,
        TransformToMenu
    ],
    imports: [
        CommonModule,
        NgSelectModule,
        NgGenericComponentsModule,
        HttpClientModule,
        FormsModule,
        ButtonModule,
        CardModule,
        ConfirmDialogModule,
        DialogModule,
        DropdownModule,
        InputTextModule,
        MenuModule,
        MenubarModule,
        MultiSelectModule,
        ProgressSpinnerModule,
        SidebarModule,
        ToastModule,
        ToolbarModule,
        TooltipModule,
        CheckboxModule,
        RadioButtonModule,
        InputSwitchModule
    ],
    exports: [
        ...components.NAVIGATION_COMPONENTS,
        TransformToMenu
    ],
    providers: [
        AlEmbeddedUrlsService,
        AlUrlFilterService,
        ConfirmationService,
        MessageService,
        {
            provide: ErrorHandler,
            useClass: AlGlobalErrorService,
        }
    ]
})
export class NgNavigationModule {
}
