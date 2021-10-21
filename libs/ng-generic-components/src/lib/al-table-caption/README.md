# Al Table Caption

## Summary
You will have the possibility to change the columns that you want to be displayed in your table, in addition to resetting the default columns and you can also use a search-bar, these elements are optional, if you don't want to use any you can specify it in the component inputs.

Authors:
- Fabio Miranda (fmiranda@alertlogic.com)
- Juan Galarza (juan.galarza@alertlogic.com)

## Example Usage

    // ts
    public columns: Array<{}> = [];
    public storageKey: string = "";
    public showColumnsSelector: boolean = true;
    public showSearch: boolean = true;
    public showDownload: boolean = true;
    public donwloadLabel: string = "download label";

    constructor() {
        this.columns = [
            { 
                header: "Name",
                field: "name", 
                sortableColumn: "name" 
            },
            {
                header: "Country",
                field: "country",
                sortableColumn: "country.name",
            },
            {
                header: "Representative",
                field: "representative",
                sortableColumn: "representative.name",
            },
            { 
                header: "Date", 
                field: "date", 
                sortableColumn: "date" },
            { 
                header: "Status", 
                field: "status", 
                sortableColumn: "status" },
            {
                header: "Activity",
                field: "activity",
                sortableColumn: "activity",
            },
        ];
        this.storageKey = "my-table"
        this.showColumnsSelector = true;
        this.showSearch = true;
    }

	searchTable() {
        console.log("Hanlde the search")
    }

    changeColumns(event:{columns:[]}) {
        console.log(event.columns)
    }
    
    // HTML
	<al-table-caption 
		[cols]="columns"
		[defaultColumns]="columns"
		[storageKey]="storageKey"
		[showColumnsSelector]="showColumnsSelector"
		[showSearch]="showSearch"
		(onSearched)="searchTable($event)"
		(onChangeColumns)="changeColumns($event)"
		>
	</al-table-caption>



## Inputs
 
| Name  | Type | Default | Description |
|-------|------|---------|-------------|
| cols     |Array     |        []         |List with all the columns in the table.|
| defaultColumns     |Array     |        []         |List of default columns in the table.|
| storageKey     |String     |"dynamic-table-default"         |The key where you want to save the state in the localStorage.|
| showColumnsSelector     |boolean     |        true         |Allows define if you want to use the column selector.|
| showSearch     |boolean     |        true         |Allows define if you want to use the search input.|
| showDownload     |boolean     |        false         |Allows define if you want to use the download button.|
| downloadLabel     |string     |        "Download All"         |Allows define the label that you want to use in the download button.|
| useLocalStorage     |boolean     |        true         |Allows define if you want to use the local storage to save your data configuration.|

## Outputs
 
| Name  | Description |
|-------|-------------|
| onSearched     |Emit an event when user type in the search bar.|
| onChangeColumns     |Emit an event with the selected columns when the user change the multi selector.|
| onDownload     |Emit an event when user click the download button.|
