# AL Boxes Selector

Component for selecting options from a group of squares items

![al-boxes-selector](https://algithub.pd.alertlogic.net/storage/user/551/files/5a202584-9be2-11e8-8c86-ff4ef4d30c22)

## Usage

Define the array and function will be passed through al-boxes-selector component.
You must to include the following into your parent controller:

```javascript

public boxesOptionsWeek = [
    new BoxDescriptor().setDescriptor({
        id: 'Su',
        label: 'Su',
        selected: true
    }),
    new BoxDescriptor().setDescriptor({
        id: 'M',
        label: 'M',
        selected: true
    }),
    new BoxDescriptor().setDescriptor({
        id: 'Tu',
        label: 'Tu',
        selected: true
    }),
    new BoxDescriptor().setDescriptor({
        id: 'W',
        label: 'W',
        selected: true
    }),
    new BoxDescriptor().setDescriptor({
        id: 'Th',
        label: 'Th',
        selected: true
    }),
    new BoxDescriptor().setDescriptor({
        id: 'F',
        label: 'F',
        selected: true
    }),
    new BoxDescriptor().setDescriptor({
        id: 'Sa',
        label: 'Sa',
        selected: true
    }),
];

getSelectedDaysWeek(selectedDaysWeek: Array<string>) {
    console.log("selectedDaysWeek-->", selectedDaysWeek);
}

```

Using the html tag:

``` html
<al-boxes-selector [data]="boxesOptionsWeek" (onselectedItems)="getSelectedDaysWeek($event)"></al-boxes-selector>
```

## Inputs

Inputs with * are required

### data: Array < BoxDescriptor > *</sup>

This is an array which contains all items into the squares group. The user will select and unselect items. Each item will be updated when this is selected or not. The 'selected' attribute will update when the item is checked or not.

## Outputs

### onselectedItems: EventEmitter < Array < string > > *</sup>

This output will return an array which contains all ids from the selected items. This will be trigered each time an item is select or unselect.
