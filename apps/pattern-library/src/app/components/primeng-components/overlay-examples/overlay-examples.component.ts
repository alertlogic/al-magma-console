import { Component, OnInit, ViewChild } from '@angular/core';
import { Car } from '../../../types/car';
import { CarService } from '../../../service/carservice';
import { ConfirmationService } from 'primeng/api';
import { AlBetaGetStartedComponent } from '@al/ng-fancy-components';
import { AlBottomSheetHeaderOptions, AlBottomSheetComponent } from '@al/ng-generic-components';

@Component({
  templateUrl: './overlay-examples.component.html',
  providers: [ConfirmationService]
})
export class OverlayExamplesComponent implements OnInit {

  @ViewChild('tutorial', {static:false}) tutorial: AlBetaGetStartedComponent;

  cars: Car[];

  cols: any[];

  images: any[];

  display: boolean;

  headerOptions: AlBottomSheetHeaderOptions = {
    icon: 'call_merge',
    title: 'My Title',
    collapsibleFromTitle: true,
    primaryAction: {
      text: 'Save',
      disabled: true,
    },
    secondaryAction: {
      text: 'Cancel',
      disabled: false
    },
    tertiaryAction: {
      text: 'Toggle',
      disabled: false
    }
  };

  @ViewChild(AlBottomSheetComponent, {static:false}) alBottomSheet: AlBottomSheetComponent;
  constructor( private carService: CarService, private confirmationService: ConfirmationService ) {
  }

  ngOnInit(): void {
    this.carService.getCarsSmall().then(cars => this.cars = cars.splice(0, 5));

    this.cols = [
      { field: 'vin', header: 'Vin' },
      { field: 'year', header: 'Year' },
      { field: 'brand', header: 'Brand' },
      { field: 'color', header: 'Color' }
    ];

    this.images = [];
    this.images.push({
      source: 'assets/demo/images/sopranos/sopranos1.jpg',
      thumbnail: 'assets/demo/images/sopranos/sopranos1_small.jpg', title: 'Nature 1'
    });
    this.images.push({
      source: 'assets/demo/images/sopranos/sopranos2.jpg',
      thumbnail: 'assets/demo/images/sopranos/sopranos2_small.jpg', title: 'Nature 2'
    });
    this.images.push({
      source: 'assets/demo/images/sopranos/sopranos3.jpg',
      thumbnail: 'assets/demo/images/sopranos/sopranos3_small.jpg', title: 'Nature 3'
    });
    this.images.push({
      source: 'assets/demo/images/sopranos/sopranos4.jpg',
      thumbnail: 'assets/demo/images/sopranos/sopranos4_small.jpg', title: 'Nature 4'
    });
  }

  confirm() {
    this.confirmationService.confirm({
      message: 'Are you sure to perform this action?'
    });
  }

  showTutorial() {
    this.tutorial.showTutorial();
  }

  public save() {
    console.log('onSave');
  }

  public cancel() {
    console.log('onCancel');
    this.alBottomSheet.hide();
  }

  public open() {
    console.log('onOpen');
    this.alBottomSheet.open();
  }

  public toggle() {
    this.alBottomSheet.toggle();
  }
}
