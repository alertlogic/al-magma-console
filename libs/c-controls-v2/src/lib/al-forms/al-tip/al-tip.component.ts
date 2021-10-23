import { Component, Input, OnInit, ElementRef } from '@angular/core';

@Component({
   selector: 'ald-tip',
   templateUrl: './al-tip.component.html',
   styleUrls: ['./al-tip.component.scss'],
   // tslint:disable-next-line:no-host-metadata-property
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

   clickOut(event: Event): void {
     if (!this.eref.nativeElement.contains(event.target)) {
       this.showTip = false;
     }
   }

 }
