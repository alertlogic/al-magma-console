# Al Dynamic Form

## Summary
The dynamic form is a reusable component that allows create form indicating by json format the elements to show.

The elements types allowed in the dynamic form are:
* Input
* Checkbox
* Group of checkbox
* Radio button
* Textarea
* Dropdown
* Monaco editor

Authors:
- Juan Camilo Kremer (jkremer@alertlogic.com)
- Maryit Sanchez (msanchez@alertlogic.com)
- Andres David Echeverri Jimenez (andres.echeverri@alertlogic.com)

# Examples of use
ng-common-components examples: https://ng-common-components.ui-dev.product.dev.alertlogic.com/#/patterns/form/dynamic
Application Registry: https://console.configuration.product.dev.alertlogic.com/#/applications-registry/application-list/134249236?aaid=134249236&locid=defender-us-ashburn

## Especification
* **type (string)**: Mandatory: Define the type of element to show in the form, possible values:
  * string/input (Input element)
  * string/hidden (Input element)
  * string/radio (Radio button element)
  * any[]/checkbox (Group of checkbox element)
  * boolean/checkbox (Checkbox element)
  * string/dropdown (Dropdown element)
  * string/monaco-editor (Monaco editor element)
  * string/textarea (Textarea element)
  * string[]/textarea (Textarea element)
  * boolean/inputSwitch (inputSwitch element)
* **property (string)**: Mandatory: Element id.
* **label (string)**: Mandatory: Displays the label of the element.
* **description (string|string[])**: Optional: Information to show in a tooltip.
* **optional (boolean)**: Optional: Define whether the input or textarea elements are optional, if this property is not set, a required validation is added to the form control and shows a '*' in the label.
* **validationPattern (string)**: Optional: Validation pattern is added to the formcontrol.
* **placeholder (string)**: Optional: Display an example of the value in the input element.
* **options ([{value: string, label: string, disabled?: boolean}])**: Required for Group of checkbox, Dropdown and Radio button, specifies characteristics for the editor.
* **editorOptions ([{value: string, label: string}])**: Required for Monaco editor, specifies each item in the element.
* **updateNotAllowed (boolean)**: Optional: indicates whether to the component of the element value can be changed, if the value is true, the element is showing in disabled mode.
* **defaultValue (string)**: Optional: assigns a default value or in edit case the value saved for the user.
* **belowDescription (string)**: Optional: add a text below the field.
* **aboveDescription (string)**: Optional: add a text above the field.
* **patternError (string)**: Optional: custom error to show if the patter is invalid.
* **requiredError (string)**: Optional: custom error to show if the field is required.


## Implementation
```ts
dynamicFormValues = [
        {
            "type":"string/input",
            "property":"name",
            "label":"Integration Name",
            "description":"Integration Name",
            "placeholder": ""
        },
        {
            "type":"string/input",
            "property":"test",
            "label":"Test Name",
            "description":"Test Name",
            "placeholder": "some placeholder",
            "belowDescription": "some below",
            "aboveDescription": "some above",
            "requiredError": "please fill this"
        },
        {
            "validationPattern":"^(https)?:\/\/\\S+",
            "type":"string/input",
            "property":"target_url",
            "label":"Target URL",
            "description":"Target URL (for example, https://abc.com)",
            "placeholder": "Example: https://abc.com"
            "patternError": "the field must start with ABC",
        },
        {
            "updateNotAllowed":true,
            "type":"string/radio",
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
            "defaultValue":"rabbit"
        },
        {
            "updateNotAllowed":true,
            "type":"any[]/checkbox",
            "property":"colors",
            "class":"form-row",
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
            "description":"a color"
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
            "defaultValue":"rabbit"
        },
        {
            "type":"string/monaco-editor",
            "property":"template",
            "editorOptions": {"theme": 'vs', "language": 'json'},
            "label":"Payload Template",
            "description":"Payload Template",
            "defaultValue":`{\n\t"summary": "{{incident.summany}}",\n\t"timestamp": "21-01-2018",\n\t"source": "alertlogic:test",\n\t"severity": "{{incident.severity}}"\n}`
        },
   ];
   public elements: AlFormElementBase<any>[] = [];
   @ViewChild("alDynamicFormComponent")
   public dynamicForm: AlDynamicFormComponent;

   ngOnInit(){
        for(let i=0; i<this.dynamicFormValues.length;i++){
            let base = AlDynamicFormUtilityService.generateBaseProperties(this.dynamicFormValues[i]);
            const element:any = AlDynamicFormUtilityService.generateDynamicElement(base, this.dynamicFormValues[i].type);
            this.elements.push(element);
        }
    }

    // Indicated when the form has complete all the validations configured.
    onDynamicFormChanges(isValid: boolean) {
        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
            validate: isValid,
        });
    }

    submitForm() {
        // Give the result of the form in a json format, if any input or textarea has an empty value it is excluded of the response except in hidden type.
        let parameters = this.dynamicForm.onSubmit();
        console.log(parameters);
    }
```
```html
<al-dynamic-form [elements]="elements" (isValid)="onDynamicFormChanges($event)"></al-dynamic-form>
```
