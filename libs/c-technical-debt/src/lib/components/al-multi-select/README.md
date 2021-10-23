# AL Multi Select

Component with multiple or single selection. It allows searching, grouping by, clearing all selected data
and handling the end of the scroll as an event.

This component is based on https://github.com/ng-select/ng-select component

![al-multi-select working - gif](https://algithub.pd.alertlogic.net/storage/user/551/files/078ac35a-5dcc-11e8-802b-4bf4cb63cdd3)

## Usage

Define the object variable and functions will be passed through al-multi-select component.
You must to include the following into your parent controller:

```

public multiSelectConfig: object = {
    placeholder: "Select Filters",
    items: [
        { id: '1', value: 'Adam', country: 'United States'},
        { id: '2', value: 'Samantha', country: 'United States',},
        { id: '3', value: 'Amalie', country: 'Argentina'},
        { id: '4', value: 'Estefanía', country: 'Argentina'},
        { id: '5', value: 'Adrian', country: 'Ecuador'},
        { id: '6', value: 'Wladimir Zuajmaics', country: 'Ecuador'},
        { id: '7', value: 'Natasha', country: 'Ecuador'},
        { id: '8', value: 'Nicole', country: 'Colombia'},
        { id: '9', value: 'Michael', country: 'Colombia'},
        { id: '0', value: 'Nicolás', country: 'Colombia' }
    ],
    selectedItems: ['0'],
    labelToBind: "value",
    valueToBind: "id",
    groupBy: "country"
};

handleSelection(data: Array<any>) {
    console.log("Getting from multi-select -> ", data);
}

handleEndScroll() {
    console.log("Handling end of the scroll...");
}

```

Using the html tag:

``` html
<al-multi-select
    [config]="multiSelectConfig"
    [disabled]="disabled"
    [multiple]="false"
    (onChangedData)="handleSelection($event)"
    (onEndedScroll)="handleEndScroll()">
</al-multi-select>
```

## Inputs

Inputs with * are required

### **config**: object; <sup>*</sup>

All config which will be used by the component. The config's properties are shown as following:

* placeholder: string <sup>Optional</sup><br>
Text will be shown as placeholder when there are not selected items.

* items: Array; <sup>*</sup><br>
All available items will be shown in the component's list.

* selectedItems: Array; <sup>*</sup><br>
Items which are previously selected, these can be an array of string IDs or an array of objects. This depends on ```valueToBind``` attribute's definition.

* labelToBind: string; <sup>*</sup><br>
Text which be shown in the dropdown in each selectable item.

* valueToBind: string; <sup>Optional</sup><br>
Object property which defines the ID of each item to bind. If it is not specified, the output data will be an array of item objects, otherwise a selected item IDs Array will be return.

* groupBy: string; <sup>Optional</sup><br>
Object property defines the condition which the items will be group by. If this is not specified the list will not group.

### **disabled:** boolean; <sup>Optional</sup>

Indicates if the component is disabled or not. ```False``` by default.

### **multiple:** boolean; <sup>Optional</sup>

Indicates if the component will allow multiple or single selection. ```True``` by default.

## Outputs

Outputs with * are required

### **onChangedData:** event; <sup>*</sup>

Returns an array of objects or string IDs (referencing the selected items) when the list of selected items change. The returned value depends on ```valueToBind``` attribute's definition.

### **onEndedScroll:** event; <sup>Optional</sup>

This function will be triggered when the scroll reaches the end.
