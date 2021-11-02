
 import { Component, Input, Output, EventEmitter} from '@angular/core';

 type assetType = 'network' | 'subnet' | 'deployment';
 
 @Component({
     selector: 'deployment-assets-manager-delete-dialog',
     templateUrl: './deployment-assets-manager-delete-dialog.component.html',
     styleUrls: ['./deployment-assets-manager-delete-dialog.component.scss']
 })
 export class DeploymentAssetsManagerDeleteDialogComponent {

     @Input() headerText = 'WARNING';
     @Input() display: boolean = false;
     @Input() textBody: string = "Are you sure ?";
     @Input() confirmationText: string = "I understand and I want to proceed";
     @Output() onContinue: EventEmitter<void> = new EventEmitter();
     @Output() onCancel: EventEmitter<void> = new EventEmitter();

     accept: boolean = false;
     defaultWarning: boolean = true;
     closeable: boolean = false;
     private type: assetType;
 
     constructor() { }
 
     continue(_): void {
          this.onContinue.emit();
          this.display = false;
     }
 
     cancel(_): void {
        this.onCancel.emit();
        this.display = false;
     }

     open(type: assetType, textBody?: string, headerText?: string, defaultWarning?: boolean): void {
         if (textBody) {
            this.textBody = textBody;
         }
         if (headerText) {
            this.headerText = headerText;
         }
         if (typeof defaultWarning === 'boolean'){
            this.defaultWarning = defaultWarning;
         }
        this.type = type;
        this.accept = false;
        this.display = true;
     }

     getType(): assetType {
         return this.type;
     }
 } 
 
