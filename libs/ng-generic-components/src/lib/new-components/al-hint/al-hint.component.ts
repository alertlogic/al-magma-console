/**
 * al-hint
 *
 * @author Rob Parker <robert.parker@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2021
 *
 */
 import { Component, Input, OnInit } from '@angular/core';

 @Component({
   selector: 'al2-hint',
   templateUrl: './al-hint.component.html'
 })
 export class AlHintComponent implements OnInit {

   @Input() hint: string = 'This is a hint';

   constructor() { }

   ngOnInit(): void {
   }

 }
