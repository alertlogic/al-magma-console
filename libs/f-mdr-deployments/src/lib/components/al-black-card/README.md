# AL black card

A component for displaying a black card with title, subtitle and icon

![screen shot 2018-08-06 at 11 36 34 am](https://algithub.pd.alertlogic.net/storage/user/656/files/434a0482-9981-11e8-9742-9d9bcdfce1db)

## Usage

Import the class AlBlackCardDescriptor

```javascript
import { AlBlackCardDescriptor } from '../../design';


public cardSamples: AlBlackCardDescriptor[] = [
    new AlBlackCardDescriptor().import({
        iconClass: "",
        iconMaterial: "dns",
        title: "www.mydomain.com",
        subtitle: ""
    })
];

onClickCard($event){
    console.log("clicked card: ", $event);
}
```

HTML

``` html
<div class="container" fxLayout="row wrap" fxLayoutGab="10px">
    <al-black-card *ngFor="let cardSample of cardSamples"
        [dataCard]="cardSample"
        (clickCard)="onClickCard($event)">
    </al-black-card>
</div>
```

## Inputs

Inputs with * are required

### dataCard: AlBlackCardDescriptor;<sup>*</sup>

This content the data to show the title and info blocks, check the AlBlackCardDescriptor

## Outputs

### clickCard

This returns the dataCard when it is clicked