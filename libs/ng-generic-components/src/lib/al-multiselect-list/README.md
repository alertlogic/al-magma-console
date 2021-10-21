# Al Multi Select With List

This is an enhanced version of the original multiselect from primeng. Includes details for the options
and list with actions.

**Note:** This component is like a input, that means it can meke use of the directives ```ngModel``` and ```formControlName```

![multiselect-list](https://algithub.pd.alertlogic.net/storage/user/735/files/85ee1d00-6e82-11ea-8200-a15e6af57a79)

## Requires

Requires either the **AlSelectItem** or **AlChipItem** interface from multi-select component:

```typescript
import { AlSelectItem } from '@al/ng-generic-components';
// or
import { AlChipItem } from '@al/ng-generic-components';
```

## Usage



Full mode:

```html
<al-multiselect-list placeholder="Change the label here" [options]="yourOptions" (onSelectedOption)="selectOption($event)"></al-multiselect-list>
```

By default the selected options will be render as vertically oriented list of items. You can change that to display the items as a set of chips separated by ORs and ANDs
by using the selectableListMode input set to `chips` (by default it uses `list`)

```html
<al-multiselect-list placeholder="Change the label here" [options]="yourOptions" selectableListMode="chips"  (onSelectedOption)="selectOption($event)"></al-multiselect-list>
```

Simplest mode:

```html
<al-multiselect-list [options]="yourOptions"></al-multiselect-list>
```

## Displaying Details

When Multiselect uses the **AlSelectItem** interface from **multi-select component** if you want to specify details just
add a "details" field to the value object:

Specify "details":

```typescript
    {
        title: "John Wick",
        subtitle: "jshonwick@mydetails.com" // Details that will be displayed at bottom.
        value: { // The value object that could contain anything.
            anyValue: "1",
            anyOtherValue: "Any value!"
        }
    }
```

When Multiselect uses the **AlChipItem** interface you also need to pass the separator that each chip will use (permited values are `AND`, `and`, `OR` and `or`)

```typescript
    {
        title: "John Whick",
        separator: 'AND'
        subtitle: "jshonwhick@mydetails.com" // Details that will be displayed at bottom.
        value: { // The value object that could contain anything.
            anyValue: "1",
            anyOtherValue: "Any value!"
        }
    }
```

## Selected Options

To grab the selected options you can bind a listener to the "onSelectedOption" every time the user select or delete a item from the list:

```html
    <al-multiselect-list [options]="multiSelectWithListItems" (onSelectedOption)="selectOption($event)"></al-multiselect-list>
```
