# @al/ng-generic-components/al-toast

## Toast Component for Alert Logic Angular Applications

A ready made toast component for usage with powered Alert Logic Angular applications

## Usage

Include an instance in your component's HTML providing an unique key string

````
<al-toast key="myToastId"></al-toast>
````

Inject `AlToastService` in your component
````
import { AlToastService } from '@al/ng-generic-components/al-toast';

constructor(private alToastService: AlToastService) {
    // Following subscription is only necessary if your toast messages have buttons that you want to listen for click events
    this.alToastService.getButtonEmitter('myToastId').subscribe(
      (button) => {
        // Do something after button is clicked
      }
    );
}
````

Send a message using our predefined `AlToastMessage` interface
````
const alToastMessage: AlToastMessage = {
    sticky: false,
    closable: true,
    data: {
        title: 'This is the title',
        message: 'This is a test message, here you can put whatever you want, choose wisely your words',
        iconClass: 'pi-exclamation-triangle',
        buttons: [
            {
                key: 'cancel',
                label: 'Cancel',
                class: 'p-col-fixed',
                textAlign: 'right'
            },
            {
                key: 'save',
                label: 'Save',
                class: 'p-col-fixed',
                textAlign: 'right'
            }
        ]
    }
};
this.alToastService.showMessage('myToastId', alToastMessage);
````

