import { Component } from "@angular/core";

@Component({
    selector: "table-caption",
    templateUrl: "./table-caption.component.html",
    styleUrls: ["./table-caption.component.scss"],
})
export class TableCaptionComponent {
    // Common variables
    public columns: any[] = [];
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
                sortableColumn: "name",
                width: "10px"
            },
            {
                header: "Country",
                field: "country",
                sortableColumn: "country.name",
                width: ""
            },
            {
                header: "Representative",
                field: "representative",
                sortableColumn: "representative.name",
            },
            { 
                header: "Date", 
                field: "date", 
                sortableColumn: "date",
                width: "100px"
            },
            { 
                header: "Status", 
                field: "status", 
                sortableColumn: "status",
                width: "100px"
            },
            {
                header: "Activity",
                field: "activity",
                sortableColumn: "activity",
                width: "100px"
            },
        ];
        this.storageKey = "my-table"
        this.showColumnsSelector = true;
        this.showSearch = true;
    }

    searchTable(event:any) {
        console.log(event)
    }

    download(event: any) {
        console.log("download button clicked", event)
    }

    changeColumns(event:any) {
        console.log(event.columns)
    }
}
