import { Component, ViewEncapsulation, OnInit, ViewChild } from '@angular/core';
import { AlFormElementBase, AlDynamicFormUtilityService, AlDynamicFormComponent } from '@al/ng-forms-components';
import { SelectItem } from 'primeng/api';
import { AlDynamicFormControlElement } from '@al/core';

@Component({
    selector: 'forms-dynamic',
    templateUrl: './forms-dynamic.component.html',
    styleUrls: ['./forms-dynamic.component.scss'],
    encapsulation: ViewEncapsulation.Emulated
})
export class FormsDynamicComponent implements OnInit{

    cities: SelectItem[] = [];
    selectedCities: string[] = [];

    dynamicFormValues: AlDynamicFormControlElement[] = [
        {
            "title": "Details title",
            "type":"string/input",
            "property":"name",
            "label":"Integration Name",
            "description":"Integration Name",
            "placeholder": "",
            "minLength": 3,
            "maxLength": 20
        },
        {
            "type":"integer/input",
            "property":"age",
            "label":"Age",
            "description":"Age",
        },
        {
            "type":"number/input",
            "property":"height",
            "label":"Height",
            "description":"Height",
            "maxValue": 500,
            "minValue": 2
        },
        {
            "type":"string/inputResponder",
            "property":"responder",
            "responderOptions":{
                type:"input",
                buttonLabel: "Variables",
                options: [
                    {
                        group: 'Alert logic',
                        options: [
                            {label: 'Incident Id', value: 'incident().id', description: 'incident id'},
                            {label: 'Incident date', value: 'incident().date', description: 'a text with a tooltip a little long(example: 2020-08-10T11:22:27.799796+00:00)'},
                            {label: 'Incident Name', value: 'incident().id', description: 'incident name'},
                            {label: 'Remediation Id', value: 'remediation().id', description: 'remediation id'},
                            {label: 'Remediation Count', value: 'remediation().count()', description: 'remediation id'},
                            {label: 'Remediation with a deployment just a long text', value: 'remediation().countlong()', description: 'remediation id'},
                        ]
                    }
                ]
            },
            "label":"Responder input",
            "description":"Responder input",
            "defaultValue":"Responder text",
        },
        {
            "type":"string[]/multiSelectList",
            "property":"users_list",
            "label":"User list",
            "multiSelectOptions":[
                {
                    title: "Peter Piper",
                    subtitle: "(creator)",
                    value: {
                        title: "Peter Piper",
                        subtitle: "(creator)",
                        details: "Peter@piper.com",
                        checked: false
                    },
                },
                {
                    title: "Billy Hoffman",
                    subtitle: "",
                    value: {
                        title: "Billy Hoffman",
                        details: "billy@hoffman.com",
                        checked: false,
                        id: '1'
                    }
                },
                {
                    title: "Brian Pearson",
                    subtitle: "",
                    value: {
                        title: "Brian Pearson",
                        whatever:"brian@gmail.com"
                    }
                }
            ],
            "description":"Select some users",
            "placeholder": "Select",
            "requiredError": "this is required",
        },
        {
            "validationPattern":"^(https)?:\/\/\\S+",
            "type":"string/input",
            "property":"target_url",
            "label":"Target URL",
            "description":"Target URL (for example, https://abc.com)",
            "placeholder": "Example: https://abc.com",
            "requiredError": "this is a custome error whne the field is required",
            "patternError": "this field needs to start with ABC"
        },
        {
            "updateNotAllowed":true,
            "type":"string/radio",
            "property":"animal",
            "options":[
               {
                  "value":"rabbit",
                  "label":"rabbit purple",
                  "disabled": true
               },
               {
                  "value":"dog",
                  "label":"hot dog"
               },
               {
                "value":"cat",
                "label":"catsup"
             }
            ],
            "label":"Animal",
            "description":"Animal",
            "defaultValue":"dog",
        },
        {
            "updateNotAllowed":true,
            "type":"any[]/checkbox",
            "property":"colors",
            "options":[
               {
                  "value":"blue",
                  "label":"blue"
               },
               {
                  "value":"red",
                  "label":"red"
               },
            ],
            "label":"Colors",
            "description":"a color",
        },
        {
            "type":"string/dropdown",
            "property":"animal_place",
            "placeholder": "--Select one--", // use this when field is required, and do not set default for this value
            "options":[
               {
                  "value":"rabbit",
                  "label":"rabbit purple"
               },
               {
                  "value":"dog",
                  "label":"hot dog"
               }
            ],
            "label":"Animal with place holder",
            "description":"Animal",
        },
        {
            "type":"string/inputResponder",
            "property":"responder_dropdown",
            "responderOptions":{
                type: "dropdown",
                buttonLabel: "Variables",
                options: [
                    {
                        group: 'Alert logic',
                        options: [
                            {label: 'Incident Id', value: '<% incident().id %>', description: 'incident id'},
                            {label: 'Incident date', value: 'incident().date', description: 'a text with a tooltip a little long(example: 2020-08-10T11:22:27.799796+00:00)'},
                            {label: 'Incident Name', value: 'incident().id', description: 'incident name'},
                            {label: 'Remediation Id', value: 'remediation().id', description: 'remediation id'},
                            {label: 'Remediation Count', value: 'remediation().count()', description: 'remediation id'},
                            {label: 'Remediation with a deployment just a long text', value: 'remediation().countlong()', description: 'remediation id'},
                        ]
                    }
                ]
            },
            "options":[
                {
                   "value":"rabbit",
                   "label":"rabbit purple"
                },
                {
                   "value":"dog",
                   "label":"hot dog"
                }
            ],
            "label":"Responder input",
            "description":"Responder input",
            "defaultValue":"Responder text",
        },
        {
            "type":"string/dropdown",
            "property":"animal",
            "options":[
               {
                  "value":"rabbit",
                  "label":"rabbit purple"
               },
               {
                  "value":"dog",
                  "label":"hot dog"
               }
            ],
            "label":"Animal",
            "description":"Animal",
            "defaultValue":"rabbit",
        },
        {
            "type":"string/textarea",
            "property":"textarea",
            "label":"textarea",
            "description":"textarea tooltip",
            "defaultValue":"whatever",
            "placeholder": "Helper text"
        },
        {
            "type":"string[]/textarea",
            "dataType":"string[]",
            "property":"textarea_array",
            "label":"textarea array",
            "description":"textarea tooltip",
            "defaultValue":["red","blue","white","black"],
            "placeholder": "Helper text",
            "splitExpresion": ",",
            "joinExpresion": ","
        },
        {
            "type":"object/textarea",
            "property":"textarea_object",
            "label":"textarea object",
            "description":"textarea tooltip",
            "defaultValue":{"color": "blue", "name": "riuzaki"},
            "placeholder": "Helper text",
            "splitExpresion": "",
            "joinExpresion": ""
        },
        {
            "type":"string/monaco-editor",
            "property":"template",
            "editorOptions": {"theme": 'vs', "language": 'json'},
            "label":"Payload Template",
            "description":"Payload Template",
            "defaultValue":`{\n\t"summary": "{{incident.summany}}",\n\t"timestamp": "21-01-2018",\n\t"source": "alertlogic:test",\n\t"severity": "{{incident.severity}}"\n}`,
        },
        {
            "type":"boolean/inputSwitch",
            "property":"enable",
            "label":"enable?",
            "description":"some desc"
        },
        {
            "type": "boolean/checkbox",
            "label": 'Required ?',
            "property": 'test',
            "description": "Playbook enabled?",
        },
        {
            "type": "text/title",
            "property": "firewall_rules_column_title",
            "description": "Enable AWS Network Firewall to generate Alert Logic alerts by adding the following IPS rules to your firewall policy in AWS and ensuring that AWS Network Firewall logging is configured to output alerts to S3",
            "label": "Firewall Rules"
        },
        {
            "type": "button/link",
            "aboveDescription": '1. Download the rules.\n2. In AWS, create a firewall rule group with the rules.\n3. Configure the firewall policy to use your new rule group.\n4. (Optional) In the Alert Logic console, [create correlations](https://docs.alertlogic.com/configure/notifications/log-correlation.htm) to generate incidents from AWS Network Firewall alerts. The Message Type is "AWS Network Firewall Alert."',
            "defaultValue": "https://distributor.mdr.product.dev.alertlogic.com/v1/134224120/content/aws/network-firewall/Cloud-Defender-minimal.json.zip",
            "label": "Click here.",
            "description": "This link leads to the stuff to download",
            "property": "download_link"
        },
   ];

    public commonProperties = {
        "aboveDescription": "Some description above the input",
        "belowDescription": "Some description below the input"
    };
    public elements: AlFormElementBase<any>[] = [];
    public elementsWithMoreData: AlFormElementBase<any>[] = [];

    @ViewChild("alDynamicFormComponent") public alDynamicFormComponent?: AlDynamicFormComponent;

    ngOnInit(){

        let dynamicWithAboveBelow = this.dynamicFormValues.map( item =>{
            let itemCopy = Object.assign({}, this.commonProperties, item);
            return itemCopy;
        });

        for(let i=0; i<this.dynamicFormValues.length;i++){
            let base = AlDynamicFormUtilityService.generateBaseProperties(this.dynamicFormValues[i]);
            const element:any = AlDynamicFormUtilityService.generateDynamicElement(base, this.dynamicFormValues[i].type);
            this.elements.push(element);
        }
        console.log(this.elements);

        for(let i=0; i<dynamicWithAboveBelow.length;i++){
            let base = AlDynamicFormUtilityService.generateBaseProperties(dynamicWithAboveBelow[i]);
            const element:any = AlDynamicFormUtilityService.generateDynamicElement(base, dynamicWithAboveBelow[i].type);
            this.elementsWithMoreData.push(element);
        }

        this.cities = [];
        this.cities.push({ label: 'Select City', value: 0 });
        this.cities.push({ label: 'New York', value: { id: 1, name: 'New York', code: 'NY' } });
        this.cities.push({ label: 'Rome', value: { id: 2, name: 'Rome', code: 'RM' } });
        this.cities.push({ label: 'London', value: { id: 3, name: 'London', code: 'LDN' } });
        this.cities.push({ label: 'Istanbul', value: { id: 4, name: 'Istanbul', code: 'IST' } });
        this.cities.push({ label: 'Paris', value: { id: 5, name: 'Paris', code: 'PRS' } });
    }

    onDynamicFormChanges(isValid: boolean) {
        console.log("onDynamicFormChanges is valid", isValid);
        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
            validate: isValid,
        });
        console.log("dynamic form changes", this.alDynamicFormComponent?.onSubmit());
    }
}
