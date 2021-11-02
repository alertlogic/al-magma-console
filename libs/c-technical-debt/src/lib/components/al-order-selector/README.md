# AL Order Selector

A component with 3 options: A checkbox, a selector and an ordering option

![screen shot 2018-04-25 at 16 26 05](https://algithub.pd.alertlogic.net/storage/user/551/files/594f0aac-4a26-11e8-921b-1887f8ad7132)

## Usage

Define the object variable and functions will be passed through al-tool-bar component.
You must to include the following into your parent controller:

```

public selectorIncidentsConfig: object = {
    isChecked: true,
    placeholder: 'Choose an option',
    selectedOption: 'byDate',
    order: 'asc',
    options: [
        {
            value: 'byDate',
            name: 'Organize by Date'
        },
        {
            value: 'byThreat',
            name: 'Organize by Threat'
        },
        {
            value: 'byClassification',
            name: 'Organize by Classification'
        },
        {
            value: 'byCategory',
            name: 'Organize by Category'
        },
        {
            value: 'byDeployment',
            name: 'Organize by Deployment'
        },
        {
            value: 'byAccount',
            name: 'Organize by Account'
        }
    ]
};

selectAllIncidents(allIncidentsSelected: boolean) {
    // This function will be launch when checked or unchecked the mat-checkbox
    console.log("Have been selected all Incidents?: ", allIncidentsSelected);
}

classifyIncidents(classifyBy: string) {
    // This function will be launch when an option is selected from the selector
    console.log("Classifying Incidents by: ", classifyBy);
}

orderIncidents(orderIncidentsBy: string) {
    // This function will be launch when this is clicked, returning 'asc' or 'desc'
    console.log("Ordering Incidents by: ", orderIncidentsBy);
}

```

Using the html tag:

``` html
<al-order-selector
    (onChecked)="selectAllIncidents($event)"
    (onSelected)="classifyIncidents($event)"
    (onSorted)="orderIncidents($event)"
    [config]="selectorIncidentsConfig">
</al-order-selector>
```
simpleMode
``` html
<al-order-selector
    (onChecked)="selectAllIncidents($event)"
    (onSelected)="classifyIncidents($event)"
    (onSorted)="orderIncidents($event)"
    [config]="selectorIncidentsConfig"
    simpleMode="true">
</al-order-selector>
```

## Inputs

Inputs with * are required

### isChecked: boolean;<sup>*</sup>

Indicates if the checkbox is checked or not.

### placeholder: string;<sup>*</sup>

Text for showing as a placeholder in the selector.

### selectedOption: string;<sup>*</sup>

Option selected from the selector.

### order: string;<sup>*</sup>

Indicates the order: 'asc' for ascending mode, and 'desc' for descending mode.

### options: array;<sup>*</sup>

Array with each option will be shown into the selector.

### value: string;<sup>*</sup>

Indicates the ID for the selected option.

### name: string;<sup>*</sup>

This text will be shown by each option into the selector.

### simpleMode: boolean;<sup>false by default</sup>

This will remove the select box and give you a narrower box
