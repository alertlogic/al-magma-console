# Al Dropdown With List

This is an enhanced version of the original dropdown from primeng. Includes details for the options and list with actions.

![al-dropdown-list](https://algithub.pd.alertlogic.net/storage/user/735/files/05cebd00-6469-11ea-9f0c-cae03c823bc6)

Authors:
- Fabio Miranda (fmiranda@alertlogic.com)
- Andres David Echeverri Jimenez (andres.echeverri@alertlogic.com)

## Requires

Requires **AlSelectItem** interface:

```typescript
import { AlSelectItem } from '@al/ng-generic-components';
```

## Usage

Full mode:

```html
<al-dropdown-list placeholder="Select"
                  [(ngModel)]="value"
                  [options]="options"
                  (ngModelChange)="selectOption($event)">
</al-dropdown-list>
```

Simplest mode:

```html
<al-dropdown-list [options]="yourOptions"></al-dropdown-list>
```

## Displaying Details

Dropdown with list uses the **AlSelectItem** interface, if you want to specify icon and category just add a "subtitle" and "icon" field to the value object:

Specify "details":

```typescript
    {
        title: "High",
        subtitle: "Threat Level"
        icon: "al-risk-high"
        value: { // The value object that could contain anything.
            anyValue: "1",
            anyOtherValue: "Any value!"
        }
    }
```