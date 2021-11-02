import { Component, Input } from '@angular/core';

@Component({
   selector: 'ald-hint',
   templateUrl: './al-hint.component.html',
   styleUrls: ['./al-hint.component.scss']
 })
 export class AlHintComponent {

   @Input() hint: string = 'This is a hint';

 }
