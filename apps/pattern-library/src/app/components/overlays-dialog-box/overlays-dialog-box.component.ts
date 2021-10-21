import { Component } from '@angular/core';
import { AlToastMessage, AlToastService } from '@al/ng-generic-components';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'overlays-dialog-box',
  templateUrl: './overlays-dialog-box.component.html',
  styleUrls: ['./overlays-dialog-box.component.scss'],
  providers: [ConfirmationService]
})
export class OverlaysDialogBoxComponent {

  constructor(
    private alToastService: AlToastService
  ) {
  }

  public timeoutShowMsg: number = 5000;

  display: boolean = false;
  displayModal: boolean;
  displayBasic: boolean;
  displayBasicLong: boolean;


  showDialog() {
    this.display = true;
  }

  showModalDialog() {
    this.displayModal = true;
  }

  showBasicDialog() {
    this.displayBasic = true;
  }

  showBasicDialogLong() {
    this.displayBasicLong = true;
  }


  showAlToast(key: string) {
    this.displayBasic = false;
    this.displayBasicLong = false;
    this.displayModal = false;
    switch (key) {
      case 'success':
        const alToastMessage: AlToastMessage = {
          sticky: true,
          closable: false,
          life: this.timeoutShowMsg,
          data: {
            message: 'Yay you! You successfully did something.',
          }
        };
        this.alToastService.showMessage('myToast', alToastMessage);
        setTimeout(() => {
          this.alToastService.clearMessages('myToast');
        }, this.timeoutShowMsg);
    }
  }
}

