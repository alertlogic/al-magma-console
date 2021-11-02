import { Component, Input } from '@angular/core';

@Component({
   selector: 'ald-data-field',
   templateUrl: './al-data-field.component.html'
 })
 export class AlDataFieldComponent {

   @Input() label: string;
   @Input() value: any;

 }
