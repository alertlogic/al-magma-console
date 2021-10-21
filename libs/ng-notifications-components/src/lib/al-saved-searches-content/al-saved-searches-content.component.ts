import { AlCardstackItem } from '@al/core';
import { AlAlertDefinition } from '@al/gestalt';
import {
    Component,
    Input,
    ViewEncapsulation,
    ViewChild,
    Output,
    EventEmitter,
} from '@angular/core';
import {
    ConfirmationService,
} from 'primeng/api';
import { AlToastMessage, AlToastService } from '@al/ng-generic-components';
import { ALCargoV2 } from '@al/cargo';

export interface AlSavedSearchProperties {
    id: string;
    caption: string;
    created?: {
        at: number,
        by: string
    };
    modified?: {
        at: number,
        by: string
    };
    active?: boolean;
    error?: string;
    createdByName?: string;
    modifiedByName?: string;
    accountId?: string;
    scheduled?: boolean;
    description?: string;
    search_request?: string;
    tags?: string[];
    schedulesTotal?: number;
}

declare class AlGenericAlertDefinition implements AlAlertDefinition {
    id: string;
    caption: string;
    properties: AlSavedSearchProperties;
}

@Component({
    selector: 'al-saved-searches-content',
    templateUrl: './al-saved-searches-content.component.html',
    styleUrls: ['./al-saved-searches-content.component.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class AlSavedSearchesContentComponent {

    @Input() item!: AlCardstackItem<AlGenericAlertDefinition, any>;
    @Output() onEditSchedule: EventEmitter<any> = new EventEmitter();
    @ViewChild("editor") editor: any;

    public editorOptions = {
        theme: 'emsqlTheme',
        language: 'emsql',
        automaticLayout: true,
        minimap: {
            enabled: false
        }
    };

    constructor(
        private confirmationService: ConfirmationService,
        private alToastService: AlToastService) {}

    closeError(item: AlCardstackItem<AlGenericAlertDefinition, any>) {
        item.properties.error = null;
    }

    public onMonacoEditorInit(editor: any) {
        this.editor = editor;
        this.editor.updateOptions({ readOnly: true });
    }

    onDeleteItemConfirmation(schedule: any) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete this schedule?',
            header: 'Delete Schedule?',
            acceptLabel: "Delete",
            rejectLabel: "Cancel",
            accept: async () => {
                try {
                    await this.deleteSchedule(schedule);
                    this.showMessage('The schedule was deleted successfully.');
                } catch (error) {
                    this.showMessage("Something went wrong. Refresh the page and try again.");
                }
            },
        });
    }

    onEditScheduleItem(schedule: any) {
        this.onEditSchedule.emit(schedule);
    }

    showMessage = (mgs: string) => {
        const alToastMessage: AlToastMessage = {
            sticky: true,
            closable: false,
            life: 5000,
            data: {
                message: mgs,
            },
        };
        this.alToastService.showMessage('saved_searches', alToastMessage);
        setTimeout(() => {
            this.alToastService.clearMessages('saved_searches');
        }, 5000);
    }

    deleteSchedule = (schedule: any) => {
        return ALCargoV2.deleteSchedule(schedule.account_id, schedule.id).then(_ => {
            this.item.properties.schedules = this.item.properties.schedules.filter((e:any) => e.id !== schedule.id);
        });
    }
}
