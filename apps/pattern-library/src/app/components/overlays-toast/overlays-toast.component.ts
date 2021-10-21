import { Component, ViewEncapsulation } from '@angular/core';
// import { AlToastMessage, AlToastService } from '@al/ng-generic-components';
import {MessageService} from 'primeng/api';
@Component({
    selector: 'overlays-toast',
    templateUrl: './overlays-toast.component.html',
    styleUrls: ['./overlays-toast.component.scss'],
    providers: [MessageService],
    encapsulation: ViewEncapsulation.Emulated,
})
export class OverlaysToastComponent {

    // constructor(private alToastService: AlToastService,
    //                      messageService: MessageService) {
    //     this.alToastService.getButtonEmitter('myToast').subscribe(
    //         (button: any) => {
    //             this.alToastService.clearMessages('myToast');
    //         }
    //     );
    // }

    constructor(private messageService: MessageService) {}

    // showAlToast(key: string) {
    //     switch (key) {
    //         case 'custom':
    //             const alToastMessage: AlToastMessage = {
    //                 sticky: true,
    //                 closable: false,
    //                 data: {
    //                     title: 'This is the title',
    //                     message: 'This is a test message, here you can put whatever you want, choose wisely your words',
    //                     iconClass: 'pi-exclamation-triangle',
    //                     buttons: [
    //                         {
    //                             key: 'dont-show',
    //                             label: 'don\'t show this message again',
    //                             class: 'p-col secondaryButton',
    //                             textAlign: 'left'
    //                         },
    //                         {
    //                             key: 'close',
    //                             label: 'not right now',
    //                             class: 'p-col-fixed',
    //                             textAlign: 'right'
    //                         },
    //                         {
    //                             key: 'upgrade',
    //                             label: 'hell yeah!',
    //                             class: 'p-col-fixed',
    //                             textAlign: 'right'
    //                         }
    //                     ]
    //                 }
    //             };
    //             this.alToastService.showMessage('myToast', alToastMessage);
    //             break;
    //     }
    // }

    // clearAlToast() {
    //     this.alToastService.clearMessages('myToast');
    // }

    showConfirm() {
        this.messageService.clear();
        this.messageService.add({key: 'c', sticky: true, severity:'warn', summary:'Are you sure?', detail:'Confirm to proceed'});
    }
}
