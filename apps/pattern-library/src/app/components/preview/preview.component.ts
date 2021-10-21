import { AfterViewInit, Component, ViewChild } from "@angular/core";
import { AlPreviewData } from "@al/ng-generic-components";

@Component({
    selector: "preview",
    templateUrl: "./preview.component.html",
    styleUrls: ["./preview.component.scss"],
})
export class PreviewComponent implements AfterViewInit{
    title: string = "";
    subtitle: string = "";
    properties: Array<{ key: string; value: string; icon?: string }> = [];
    templateData = {
        type1: "Low",
        type2: "Medium",
        type3: "High",
    }

    @ViewChild("template1") template1: any;

    public data: AlPreviewData = new AlPreviewData();

    constructor() {
        this.data.title = "Attack Generating 500-type Server Errors from 181.174.166.164";
        this.data.subtitle = "16th Nov 2020 19:09:48 GMT-5";
        this.data.properties = [
            { key: "ID", value: "rsjpc4", icon: "" },
            { key: "Threat Level", value: "Medium", icon: "fa fa-circle risk-medium" },
            { key: "Classification", value: "application-attack", icon: "" },
            { key: "Detection Source", value: "Web Log Analytics", icon: "" },
        ];
    }

    ngAfterViewInit(): void {
        this.data.properties.push({ key: "Template Example", value: this.template1, icon: "", isTemplate: true, templateData: this.templateData });
        this.data = {...this.data};
    }
}
