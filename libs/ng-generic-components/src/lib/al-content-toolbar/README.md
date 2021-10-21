# Al Content Toolbar

## Summary

The content toolbar provide search, sort, select all and group by functinalities .

Authors:

**Rakhi Mundhada** (rakhi.mundhada@alertlogic.com)

## Example Usage

### Interface

interface AlToolbarContentConfig {
    showSelectAll?: boolean;
    showSortBy?: boolean;
    sort?: {
        options?: SelectItem[];
        order?: string;
    };

    showGroupBy?: boolean;
    group?: {
        options?: SelectItem[];
    };

    search?: {
        maxSearchLength?: number;
        textPlaceHolder?: string;
    };
}

-TS

### Inputs

import { AlToolbarContentConfig } from '../types/al-generic.types';


 config: AlToolbarContentConfig = {
    showSelectAll: false,
    showGroupBy: false,
    showSortBy: true,
    sort: {
        order: 'asc',
        options: [
            {
                label: 'option1',
                value: 'option_1'
            },
            {
                label: 'option2',
                value: 'option_2'
            }]
    },
    search: {
        maxSearchLength: 20,
        textPlaceHolder: "search"
            },
    group: {
        options: [
            {
                label: 'group1',
                value: 'group_1'
            },
            {
                label: 'group2',
                value: 'group_2'
            }]
    }
};


### Output
    onOrderBy:  Event will trigger on click of asc/desc order icon and will emit the selected order.

    onSearched: Event will trigger on search input
    onSortSelection: Event will trigger whenever sorting dropdown value get change
    onGroupSelection: Event will trigger whenever group by dropdown value get change
    onSelectAll: Event will trigger when checkbox value get checked

    Public sortByOrder(order:String){
        console.log(order);
    }

    Public applyTextFilter(searchInput:String){
        console.log(searchInput);
    }

    Public sortByChanged(selectedItem:String){
        console.log(selectedItem);
    }


### HTML
Include an instance in your component's HTML providing an config input .
#### simple usage

```
<al-content-toolbar [config]="config"
                (onSearched)="applyTextFilter($event)" >
</al-content-toolbar>

```

#### Full usage

```
<al-content-toolbar [config]="toolbarConfig" (onOrderBy)="sortByOrder($event)"
                    (onSearched)="applyTextFilter($event)" (onSortSelection)="sortByChanged($event)"
                    (onGroupSelection)="groupBy($event)" (onSelectAll)="handleSelectAll($event)">
</al-content-toolbar>

```
