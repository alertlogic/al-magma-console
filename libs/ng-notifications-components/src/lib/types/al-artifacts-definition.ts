import { ExecutionRecordV2, TableauReportDefinitionV2, ReportArtifactV2 } from '@al/cargo';
import { formatDate } from '@angular/common';

export declare class AlArtifactsProperties {
    id: string;
    caption: string;
    name?: string;
    scheduledTime?: number;
    viewId?: string;
    format?: string;
    scheduleId?: string;
    subtitle?: string;
    toptitle?: string;
    // filterableBy propery must be part of definations otherwise it will not work for inline sort serach
    // cause issue for defaultCBFilter as its not able to find those propety if developer miss it accedentily
    display?: string;
    scheduleName?:string;
    artifactData?: ReportArtifactV2;
    downloading?:boolean;
}

export class AlArtifactsDefinition {
    id: string;
    caption: string;
    properties: AlArtifactsProperties;

    constructor(rawData: ExecutionRecordV2) {
        this.id = rawData.id || '';
        this.caption = '';

        this.properties = {
            id: rawData.id || '',
            caption: '',
        };

        if (rawData.schedule_id) {
            this.properties.scheduleId = rawData.schedule_id;

            // mapping data as its needed for inline sort filter search
            this.properties.scheduleName = rawData.schedule_id;
            this.properties.display = 'true';
        }

        if (rawData.scheduled_time) {
            const date = formatDate(rawData.scheduled_time*1000, 'MMM dd yyyy HH:mm:ss z', "en-US");
            this.properties.caption = date ? date : '';
            this.properties.scheduledTime = rawData.scheduled_time;
            this.caption = date ? date : '';
        }

        if(rawData.artifact_data){
            this.properties.artifactData =  rawData.artifact_data;
        }

        if (rawData.type === 'tableau') {
            this.properties.viewId = (rawData.definition as TableauReportDefinitionV2).view_id;
            this.properties.format = (rawData.definition as TableauReportDefinitionV2).format;
        }else if (rawData.type === 'search_v2'){
            this.properties.format = 'csv';
        }

        if (rawData.name) {
            this.properties.subtitle = rawData.name;
        }
    }
}

