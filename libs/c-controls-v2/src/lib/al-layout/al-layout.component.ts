import { Component, OnInit, ViewChild, ElementRef, HostBinding } from '@angular/core';

@Component({
  selector: 'ald-layout',
  templateUrl: './al-layout.component.html',
  styleUrls: ['./al-layout.component.scss']
})
export class AlLayoutComponent implements OnInit {

  @HostBinding('class') class = 'ald-layout';

  constructor() { }

  ngOnInit(): void {

  }

}
