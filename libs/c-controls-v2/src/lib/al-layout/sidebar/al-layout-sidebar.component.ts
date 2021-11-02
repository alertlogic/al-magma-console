import { Component, EventEmitter, Input, Output, HostBinding } from '@angular/core';

@Component({
  selector: 'ald-layout-sidebar',
  templateUrl: './al-layout-sidebar.component.html',
  styleUrls: ['./al-layout-sidebar.component.scss']
})
export class AlLayoutSidebarComponent {

  @Input() title: string;
  @Output() didOpen: EventEmitter<void> = new EventEmitter();
  @Output() didClose: EventEmitter<void> = new EventEmitter();

  @HostBinding('class') class = 'ald-layout-sidebar u-fill-height';

  isOpen: boolean = false;

  constructor() { }

  public toggle() {
    this.isOpen = !this.isOpen;
  }

  public open() {
    this.isOpen = true;
    this.didOpen.emit();
  }

  public close() {
    this.isOpen = false;
    this.didClose.emit();
  }

}
