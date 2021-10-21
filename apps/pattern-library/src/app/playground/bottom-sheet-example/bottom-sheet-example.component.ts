import { Component, OnInit, ViewChild } from '@angular/core';
import { AlBottomSheetHeaderOptions, AlBottomSheetComponent } from '@al/ng-generic-components';

@Component({
  selector: 'app-bottom-sheet-example',
  templateUrl: './bottom-sheet-example.component.html',
  styleUrls: ['./bottom-sheet-example.component.css']
})
export class BottomSheetExampleComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  headerOptions: AlBottomSheetHeaderOptions = {
    icon: 'security',
    title: 'Create Incident',
    collapsibleFromTitle: false,
    primaryAction: {
      text: 'Save',
      disabled: true,
    },
    secondaryAction: {
      text: 'Cancel',
      disabled: false
    }
  };

  @ViewChild(AlBottomSheetComponent) alBottomSheet!: AlBottomSheetComponent;

  public save() {
    console.log('save');
  }

  public cancel() {
    console.log('cancel');
    this.alBottomSheet.hide();
  }

  public open() {
    console.log('open');
    this.alBottomSheet.open();
  }

}
