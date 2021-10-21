import { Component } from '@angular/core';
import { Message, MessageService } from 'primeng/api';

@Component({
    templateUrl: './message-examples.component.html',
    styles: [`
        :host ::ng-deep button {
            margin-right: .25em;
            min-width: 8em;
        }

        :host ::ng-deep .ui-message {
            margin-left: .25em;
        }

        :host ::ng-deep #dont-show {
            color: #868686;
        }
    `],
    providers: [MessageService]
})
export class MessageExamplesComponent {

    msgs: Message[] = [];
    toastConfig = {
        detail: 'This is a test message, here you can put whatever you want, choose wisely your words',
        closeable: false,
        title: 'This is the title',
        iconClass: 'pi-exclamation-triangle',
        buttons: [
            {
                key: 'dont-show',
                label: 'don\'t show this message again',
                class: 'p-col',
                textAlign: 'left'
            },
            {
                key: 'close',
                label: 'not right now',
                class: 'p-col-fixed',
                textAlign: 'right'
            },
            {
                key: 'upgrade',
                label: 'hell yeah!',
                class: 'p-col-fixed',
                textAlign: 'right'
            }
        ]
    };


    constructor( private service: MessageService ) {
    }

    showInfoViaToast() {
        this.service.add({ key: 'tst', severity: 'info', summary: 'Info Message', detail: 'PrimeNG rocks' });
    }

    showWarnViaToast() {
        this.service.add({ key: 'tst', severity: 'warn', summary: 'Warn Message', detail: 'There are unsaved changes' });
    }

    showErrorViaToast() {
        this.service.add({ key: 'tst', severity: 'error', summary: 'Error Message', detail: 'Validation failed' });
    }

    showSuccessViaToast() {
        this.service.add({ key: 'tst', severity: 'success', summary: 'Success Message', detail: 'Message sent' });
    }

    showMultipleViaToast() {
        this.service.addAll([
            { key: 'tst', severity: 'info', summary: 'Message 1', detail: 'PrimeNG rocks' },
            { key: 'tst', severity: 'info', summary: 'Message 2', detail: 'PrimeReact rocks' },
            { key: 'tst', severity: 'info', summary: 'Message 3', detail: 'PrimeFaces rocks' }
        ]);
    }

    showInfoViaMessages() {
        this.msgs = [];
        this.msgs.push({ severity: 'info', summary: 'Info Message', detail: 'PrimeNG rocks' });
    }

    showWarnViaMessages() {
        this.msgs = [];
        this.msgs.push({ severity: 'warn', summary: 'Warn Message', detail: 'There are unsaved changes' });
    }

    showErrorViaMessages() {
        this.msgs = [];
        this.msgs.push({ severity: 'error', summary: 'Error Message', detail: 'Validation failed' });
    }

    showSuccessViaMessages() {
        this.msgs = [];
        this.msgs.push({ severity: 'success', summary: 'Success Message', detail: 'Message sent' });
    }

    showMultipleViaMessages() {
        this.msgs = [];
        this.msgs.push({ severity: 'info', summary: 'Message 1', detail: 'PrimeNG rocks' });
        this.msgs.push({ severity: 'info', summary: 'Message 2', detail: 'PrimeUI rocks' });
        this.msgs.push({ severity: 'info', summary: 'Message 3', detail: 'PrimeFaces rocks' });
    }

}
