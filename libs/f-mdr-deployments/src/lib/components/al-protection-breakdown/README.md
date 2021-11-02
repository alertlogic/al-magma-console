# AL protection breakdown

A component for display the scope of protection.

![screenshot al-protection-breakdown](https://algithub.pd.alertlogic.net/storage/user/491/files/00a7a800-af6b-11e8-85db-16536b4f30bd)


## Usage

Import the types and build the data structure

```javascript
import { AlProtectionBreakdownDescriptor } from '../../design/types';
public alProtectionBreakdownConfig = AlProtectionBreakdownDescriptor.import([
        { count: 10, showCount: true, label: "UNPROTECTED", showLabel: true, hideLeftSeparator: true, iconClass: "fa fa-circle red-color", hideItem: false},
        { count: 0, showCount: false, label: "RULES APPLIED", showLabel: true, hideLeftSeparator: false, iconClass: "fa fa-circle orange-color", hideItem: false},
        { count: 0, showCount: false, label: "PROTECTED", showLabel: true, hideLeftSeparator: false, iconClass: "fa fa-circle green-color", hideItem: false},
        { count: 4, showCount: true, label: "Essentials", showLabel: true, hideLeftSeparator: true, iconClass: "al al-protection-1", hideItem: false},
        { count: 0, showCount: true, label: "Professional", showLabel: true, hideLeftSeparator: true, iconClass: "al al-protection-2", hideItem: false},
        { count: 0, showCount: true, label: "Enterprise", showLabel: true, hideLeftSeparator: true, iconClass: "al al-protection-3", hideItem: false}
    ]);
```

The HTML for the **al-protection-breakdown**
``` html
    <al-protection-breakdown
        [config]="alProtectionBreakdownConfig"
        [title]="'Protection Breakdown (by VPC)'"
        [textSearchPlaceHolder]="'Search assets'"
        (onSearched)="onSearchedProtected($event)">
    </al-protection-breakdown>
```

## Inputs

Inputs with * are required

### config:AlProtectionBreakdownDescriptor;<sup>*</sup>

This is an array of the internal representation of the compoment

### title:string;

This is the title to show over the component

### textSearchPlaceHolder:string;

This is place holder to show in the input search

## Ouputs

### onSearched

It is triggered by value change.
