import { Component } from '@angular/core';
import { AlBaseCardConfig, AlBaseCardFooterActions, alEditDeleteFooterActions } from '@al/ng-cardstack-components';

@Component({
    selector: 'notifications-component-examples',
    templateUrl: './notifications-component-examples.component.html',
    styleUrls: ['./notifications-component-examples.component.scss']
})
export class NotificationsComponentExamplesComponent {

    public frequencies0:string[]|false = false;
    public frequencies1 = ['daily'];
    public frequencies2 = ['daily', 'weekly', 'monthly'];

    public alBaseCardFooterActions: AlBaseCardFooterActions = {
        left: [
            {
                event: 'download',
                icon: 'get_app',
                visible: true,
                text: "DOWNLOAD"
            },
            {
                event: 'download',
                icon: 'get_app',
                visible: true,
                text: "VIEW ARTIFACTS"
            }
        ],
        right: alEditDeleteFooterActions
    };

    public alBaseCardConfigIcon: AlBaseCardConfig = {
        toggleable: true,
        toggleableButton: true,
        checkable: true,
        hasIcon: true,
    };

    public cardIncidents = {
        type: "alert",
        id: "832DEEB9-45FE-4E50-9342-15B4878C1C3F",
        caption: "Incident example 1 test",
        icon: { name: 'announcement' },
        properties: {
            id: "832DEEB9-45FE-4E50-9342-15B4878C1C3F",
            caption: "Incident example 1 test- Incident Notification",
            createdTime: 1585148258,
            modifiedTime: 1585148258,
            emailSubject: "{{threat}} Threat Incident (ID:{{incident_id}}) : {{attack_summary}}",
            accountId: "2",
            notificationType: "incidents/alerts",
            createdByName: "Maryit Sanchez",
            modifiedByName: "Maryit Sanchez",
            usersName: [{ isCreator: true, name: "Maryit Sanchez" },{name:"Ana Victoria"},{name:"Chechelo"}],
            integrationsName: ["ABC", "BDC"],
            recipientsTotal: 1,
            escalated: true,
            subtitle: "Most recent notification sent: 23 Apr 2020 9:23 GMT-5",
            accountsName: [
                { isCreator: true, name: "ALMK" },
                { isCreator: false, name: "Albert Enterprise" },
                { isCreator: false, name: "Albert Enterprise 2" },
                { isCreator: false, name: "Albert Enterprise 2" },
                { isCreator: false, name: "Albert Enterprise 2" },
                { isCreator: false, name: "Albert Enterprise 2" },
                { isCreator: false, name: "Albert Enterprise 2" },
                { isCreator: false, name: "Albert Enterprise 2" },
                { isCreator: false, name: "Albert Enterprise 2" },
                { isCreator: false, name: "Albert Enterprise 2" },
                { isCreator: false, name: "Albert Enterprise 2" },
                { isCreator: false, name: "Albert Enterprise 2" },
            ],
            threatLevel: ["Medium","Low","Critical"]
        },
        footerActions: {
            right: alEditDeleteFooterActions
        },
        entity: null,
        expanded: false,
    };


    public cardIncidents2 = {
        type: "alert",
        id: "832DEEB9-45FE-4E50-9342-15B4878C1C3F",
        caption: "Incident example 2 test",
        icon: { name: 'announcement' },
        properties: {
            id: "832DEEB9-45FE-4E50-9342-15B4878C1C3F",
            caption: "Incident example 2 test",
            createdTime: 1585148258,
            emailSubject: "{{threat}} Threat Incident (ID:{{incident_id}}) : {{attack_summary}}",
            accountId: "2",
            notificationType: "incidents/alerts",
            createdByName: "Maryit Sanchez",
            usersName: [] as any,
            integrationsName: [] as any,
            recipientsTotal: 1,
            subtitle: "Most recent notification sent: No notifications sent.",
            accountsName: [{ isCreator: false, name: "ALMK" }],
            threatLevel: ["Medium"]
        },
        footerActions: {
            right: alEditDeleteFooterActions
        },
        entity: null,
        expanded: false,
    };

    public cardSchedule1 = {
        type: "scheduledActions",
        id: "83FCEBB0",
        caption: "Test report",
        icon: { name: 'date_range' },
        properties: {
            id: "83FCEBB0",
            recipientsTotal: 8,
            artifactCount: 2,
            caption: "Test report",
            createdTime: 1584464341,
            modifiedTime: 1584464341,
            accountId: "134270376",
            notificationType: "tableau",
            workbookId: "d4d8a509",
            viewId: "76c523cb",
            siteId: "d741e65f",
            format: "pdf",
            filters: {
                Status: [
                    "Closed",
                    "Open",
                    "Snoozed"
                ],
                Deployment: [
                    "Deployment for AWS account ABCDFGHJKL",
                    "Log Correlation Deployment",
                    "Manual Deployment",
                    "SRE Azure Deployment Testing",
                    "SRE-AL-CI-LINK"
                ],
                "Customer Account": [
                    "SRE Child Customer Level 2 (134257036)"
                ],
                Colors:[
                    "red",
                    "green",
                    "orange"
                ],
                Fruits:[
                    "orange",
                    "banana",
                    "grapes"
                ],
                Type:[
                    "incidents internal report"
                ],
                Others:[
                    "Deployment for AWS account ABCDFGHJKL",
                    "Log Correlation Deployment",
                    "Manual Deployment",
                    "SRE Azure Deployment Testing",
                    "SRE-AL-CI-LINK"
                ],
            },
            schedule: {
                monthly: {
                    minute: 40,
                    hour: 14,
                    day: 14
                }
            },
            createdByName: "Andres Echeverri",
            modifiedByName: "Andres Echeverri",
            usersName: [{ isCreator: true, name: "Maryit Sanchez" },{name:"Ana Victoria"}],
            integrationsName: [] as any,
            subtitle: "Most recent notification sent: No notifications sent.",
            viewName: "Incident Daily Digest",
            workbookName: "Incident Analysis",
            workbookSubMenu: "Threats",
            cadenceName: "monthly",
            embedUrl: "IncidentAnalysis/IncidentDailyDigest",
            contentUrl: "IncidentAnalysis",
            toptitle: "Incident Daily Digest",
            entity: null
        },
        expanded: false,
        footerActions: this.alBaseCardFooterActions,
        entity: null
    };

    onCadenceChanges(schedule: any) {
        console.log('changes : ', schedule);
    }
}
