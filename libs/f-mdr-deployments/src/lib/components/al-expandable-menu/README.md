# AL expandable menu

A component for displaying grouped step list.

![screenshot al-expandable-menu](https://algithub.pd.alertlogic.net/storage/user/492/files/c9a1da0e-9fcc-11e8-8674-35d27f4e8580)


## Usage

Import the types and build the data structure

```javascript
import { ExpandableMenuDescritor } from '../../design/types';
public data = ExpandableMenuDescritor.import({
        selected: 'exp0',
        groups: [
            {
                key: 'exp0',
                title: 'expandable 0'
            },
            {
                key: 'exp1',
                title: 'expandable 1',
                opened: false,
                items: [
                    {
                        key: 'exp1_op1',
                        title: 'opt 1 - exp 1',
                    },
                    {
                        key: 'exp1_op2',
                        title: 'opt 2 - exp 1'
                    },
                    {
                        key: 'exp1_op3',
                        title: 'opt 3 - exp 1',
                    },
                    {
                        key: 'exp1_op4',
                        title: 'opt 4 - exp 1',
                    }
                ]
            },
            {
                key: 'exp2',
                title: 'expandable 2',
                items: [
                    {
                        key: 'exp2_op1',
                        title: 'opt 1 - exp 2'
                    },
                    {
                        key: 'exp2_op2',
                        title: 'opt 2 - exp 2'
                    },
                    {
                        key: 'exp2_op3',
                        title: 'opt 3 - exp 2'
                    }
                ]
            },
            {
                key: 'exp3',
                title: 'expandable 3',
                items: [
                    {
                        key: 'exp3_op1',
                        title: 'opt 1 - exp 3'
                    }
                ]
            }
        ]
    });
```

The HTML for the **al-expandable-menu**
``` html
    <al-expandable-menu
        [data]="data"
        [enableClickNavigation]="true"
        [enableHoverHighlight]="hoverHighlight"
        (onClick)="onClick($event)">
        <any-child></any-child>
    </al-expandable-menu>
```

## Inputs

Inputs with * are required

### data:ExpandableMenuDescritor;<sup>*</sup>

This is the internal representation of the compoment

### interactiveItems:boolean;

It allows that the component can be interactive, enable the click events over the items.

### hoverHighlight:boolean;

It allows a visual feedback when the user puts the pointer over an icon in the menu.

## Ouputs

### onClick

It is triggered by clicking over any item or by next() and prev() methods

``` json
{
  "groupKey": "exp1",
  "itemKey": "exp1_op1"
}
```
## Available methods

### closeAll()
Close all the groups.

### openAll()
Open all the groups.

### enableClickNavigation(value: boolean)
It handles if the menu can be navigated using clicks directly over the items.

### prev()
Select the previous step

### next()
It selects the next step, it opens the next group if the step belongs to next group
and it enables the group to receive clicks in order to open/close.

### goto(item: string)
It goes to specific item
and it enables the group to receive clicks in order to open/close.

Get the component instance
``` ts
@ViewChild(AlExpandableMenuComponent)
    alExpandableMenuComponent: AlExpandableMenuComponent
```

Use the available methods
``` ts
    next() {
        this.alExpandableMenuComponent.api.next();
    }

    prev() {
        this.alExpandableMenuComponent.api.prev();
    }

    goto() {
        this.alExpandableMenuComponent.api.goto('exp1_op2');
    }

    closeAll () {
        this.alExpandableMenuComponent.api.closeAll();
    }

    openAll () {
        this.alExpandableMenuComponent.api.openAll();
    }

    setEnableClickNavigation(value: boolean) {
        this.alExpandableMenuComponent.api.setEnableClickNavigation(value);
    }

    setEnableHoverHighlight(value: boolean) {
        this.alExpandableMenuComponent.api.setEnableHoverHighlight(value);
    }
    onClick(event) {
        this.step = event;
    }
```

The HTML
``` html
    <button (click)="closeAll()">Close all</button>
    <button (click)="openAll()">Open all</button>
    <br>
    <button (click)="setEnableClickNavigation(true)">Interactive Items On</button>
    <button (click)="setEnableClickNavigation(false)">Interactive Items Off</button>
    <br>
    <button (click)="setEnableHoverHighlight(true)">Hover On</button>
    <button (click)="setEnableHoverHighlight(false)">Hover Off</button>
    <br>
    <button (click)="prev()">Prev</button>
    <button (click)="next()">Next</button>
    <button (click)="goto()">Go to...</button>
```
