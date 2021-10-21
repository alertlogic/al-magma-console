# Al preview

A simple component for displaying a list of fields using label\value pairs.

## Summary
You will have the possibility to display a list of properties that follow the next structure:

	AlPreviewData {
		title:string = "";
		subtitle:string = "";
		properties:Array<{key:string; value:string|AlPreviewDataValueDefinition[]|TemplateRef<any>; icon?:string; isTemplate?:boolean, templateData?:any}> = [];
	}

You can pass a template ref as value of property using templateData key, additionally you can pass the data to render properly the template. If you want to use it, you should indicate it setting isTemplate as True.

Authors:
- Fabio Miranda (fmiranda@alertlogic.com)
- Juan Galarza (juan.galarza@alertlogic.com)

## Example Usage

Simple example using single values for each property:

    // ts
    title: string = "";
    subtitle: string = "";
    properties: Array<{ key: string; value: string; icon?: string }> = [];

    public data: AlPreviewData = new AlPreviewData();

    constructor() {
        this.data.title = "Preview Data Title";
        this.data.subtitle = "Preview Data Subtitle";
        this.data.properties = [
            { key: "Assets", value: "20", icon: "al al-asset" },
            { key: "Datacenters", value: "5", icon: "al al-datacenter" },
            { key: "Hosts", value: "100", icon: "al al-host" },
        ];
    }

A more advanced example using mutliple values for each property, with each value having its own display icon (optional):

    // ts
    title: string = "";
    subtitle: string = "";
    properties: Array<{ key: string; value: string; icon?: string }> = [];

    public data: AlPreviewData = new AlPreviewData();

    constructor() {
        this.data.title = "Preview Data Title";
        this.data.subtitle = "Preview Data Subtitle";
        this.data.properties = [{ 
            key: "Threat Levels", 
            value: [
                { label: "Critical", icon: "fa fa-circle risk-critical" },
                { label: "Medium", icon: "fa fa-circle risk-medium" },
                { label: "Low", icon: "fa fa-circle risk-low" }
            ]
        }];
    }

    // HTML
	<al-preview [data]="data"></al-preview>

## Value Actions
It is also possible to assign a callback function to be invoked when clicking on values in the preview panel

    //ts
    this.data.properties = [{ 
        key: "Interesting Things", 
        value: [
            { label: "Some value", action: () => {this.doSomething();} },
            { label: "Some other value", action: () => {this.doSomethingElse();} }
        ]
    }];


## Inputs
 
| Name  | Type | Default | Description |
|-------|------|---------|-------------|
| data     |AlPreviewData     |         |Allows define the data with te props to be displayed|

