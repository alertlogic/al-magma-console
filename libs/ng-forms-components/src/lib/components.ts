/* Components */
import { AlInputResponderComponent } from './al-input-responder/al-input-responder.component';
import { AlDynamicFormComponent } from './al-dynamic-form/al-dynamic-form.component';
import { AlDynamicFormElementComponent } from './al-dynamic-form/al-dynamic-form-element/al-dynamic-form-element.component';
import { AlFilterSuggestionPipe, AlFilterTaskPalettePipe } from './pipes';
import { AlTriggerCronSchedulerComponent } from "./al-trigger-cron-scheduler/al-trigger-cron-scheduler.component";
import { AlTriggerFormComponent } from "./al-trigger-form/al-trigger-form.component";
import { AlTaskPaletteComponent } from "./al-task-palette/al-task-palette.component";
import { AlTaskPaletteItemComponent } from "./al-task-palette/al-task-palette-item/al-task-palette-item.component";
import { AlDownloadButtonElementComponent } from './al-dynamic-form/al-dynamic-form-element/download-button/al-download-button-element.component';

const ALL_COMMON = [
    AlDynamicFormComponent,
    AlDynamicFormElementComponent,
    AlInputResponderComponent,
    AlFilterSuggestionPipe,
    AlDownloadButtonElementComponent,
    AlTriggerCronSchedulerComponent,
    AlTriggerFormComponent,
    AlTaskPaletteComponent,
    AlTaskPaletteItemComponent,
    AlFilterTaskPalettePipe,
];

export {
    ALL_COMMON,
    AlDynamicFormComponent,
    AlDynamicFormElementComponent,
    AlInputResponderComponent,
    AlFilterSuggestionPipe,
    AlDownloadButtonElementComponent,
    AlTriggerCronSchedulerComponent,
    AlTriggerFormComponent,
    AlTaskPaletteComponent,
    AlTaskPaletteItemComponent,
    AlFilterTaskPalettePipe
};
