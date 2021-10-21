/**
 * al-tip
 *
 * @author Rob Parker <robert.parker@alertlogic.com>
 *
 * @copyright Alert Logic, Inc 2021
 *
 */

 import { Component, Input, OnInit, ElementRef } from '@angular/core';

 @Component({
   selector: 'al2-tip',
   templateUrl: './al-tip.component.html',
   host: {
     '(document:click)': 'clickOut($event)'
   }
 })
 export class AlTipComponent implements OnInit {

   @Input() tip: string = 'This is a tip';

   showTip = false;

   constructor(
     private eref: ElementRef
   ) { }

   ngOnInit(): void {
   }

   clickOut(event: Event) {
     if (!this.eref.nativeElement.contains(event.target)) {
       this.showTip = false;
     }
   }

 }
