# Al Base Card

## Summary
The base card is a reusable component that allows creating from a simple card to a complex card from an object.

Authors:
- Andres David Echeverri Jimenez (andres.echeverri@alertlogic.com)

# Examples of use

## Basic use

Basic card for show simple information, this configuration don't allow expand and check.

![Basic use](https://algithub.pd.alertlogic.net/storage/user/735/files/ef84c380-605a-11ea-829e-58986cb8644d)

```ts
public alBaseCardBasicItem: AlBaseCardItem = {
    id: '1',
    caption: 'Content',
    subtitle: 'Subtitle'
};
```
```html
<al-base-card [item]="alBaseCardBasicItem">
</al-base-card>
```


## Toggleable and custom content use

The card can be expandable passing an object of configuration, in this case, the card needs a content to show when it is expanded, this content can be pass-through of ng-template.

***Note:*** The toggle button can be false and the card will be expand by clicking on the content.

![Toggeable card](https://algithub.pd.alertlogic.net/storage/user/735/files/a2552180-605b-11ea-85c1-05e602a06fba)


```ts
public alBaseCardConfig: AlBaseCardConfig = {
        toggleable: true, // Allow expand and collapse the card
        toggleableButton: true, // Show the expandable and collapsible button on the rigth side
        checkable: false,
        hasIcon: false,
};

public alBaseCardBasicItem: AlBaseCardItem = {
    id: '1',
    toptitle: 'Top Title', 
    caption: 'Content',
    subtitle: 'Subtitle'
};
```
```html
<al-base-card [config]="alBaseCardConfig"
              [item]="alBaseCardBasicItem">
    <!-- A directive that referece the body content when the card is expanded -->
    <ng-template alBaseCardBodyContent>
        Hello Alert Logic!
    </ng-template>
</al-base-card>
```

## Footer Actions and checkable

The card allows establishing footer actions that can be put in right and left side.

***Note:*** Other option is pass a footer custom template, the directive for this is ```alBaseCardFooter```.

![checkable card](https://algithub.pd.alertlogic.net/storage/user/735/files/8ef68600-605c-11ea-923e-b915a8a9848a)

```ts
import { alEditDeleteFooterActions } from '@al/ng-cardstack-components';

public alBaseCardConfig: AlBaseCardConfig = {
    toggleable: true,
    toggleableButton: true,
    checkable: true, // Shows a checkbox on the left side 
    hasIcon: false,
};

public alBaseCardFooterButtons: AlActionFooterButtons = {
    event: 'download', // Allows to identify the event
    icon: 'get_app', // Icon name (material icons)
    visible: true, // Allows to show or hide the button
    text: "DOWNLOAD" // Allows to set the text
};

public alBaseCardFooterActions: AlBaseCardFooterActions = {
    left: [this.alBaseCardFooterButtons],
    right: alEditDeleteFooterActions // Default edit and delete actions
};

public alBaseCardItem: AlBaseCardItem = {
    id: '1',
    toptitle: 'Title',
    caption: 'Content',
    subtitle: 'Subtitle',
    expanded: false,
    footerActions: this.alBaseCardFooterActions
};

public footerAction(event: AlBaseCardFooterActionEvent) {
    console.log(event.name, event.value);
}
```

```html
<al-base-card [config]="alBaseCardConfig"
              [item]="alBaseCardItem"
              (onFooterAction)="footerAction($event)">
    <ng-template alBaseCardBodyContent>
        Hello Houston!
    </ng-template>
</al-base-card>
```

## With icon and item count

Shows an icon on the left side.

![icon card](https://algithub.pd.alertlogic.net/storage/user/735/files/5c00c200-605d-11ea-8f80-1cd494b8bd5e)

```ts
public alBaseCardConfigIcon: AlBaseCardConfig = {
    toggleable: true,
    toggleableButton: true,
    checkable: true,
    hasIcon: true, // Allows to show an icon on the left side
};

public alBaseCardItemCount: AlItemCount = {
    number: 135,
    text: 'Items'
};

public alBaseCardIconItem: AlBaseCardItem = {
    id: '1',
    icon: { name: 'date_range', text: 'Daily' }, // The text property can be optional
    // icon { cssClassNames: 'fa fa-circle risk-critical' } - use this property if you want to display a non material icon, e.g fontawesome
    // icon: { name: 'error', text: 'Error', cssClassNames: 'risk-critical } - can also apply additional css rules to the default material iconset, e.g. colour classes
    toptitle: 'Title',
    caption: 'Content',
    subtitle: 'Subtitle',
    expanded: false,
    footerActions: this.alBaseCardFooterActions,
    countItems: [this.alBaseCardItemCount],
};



```
# With icon without checkbox

Shows an icon on the left side and disables the checbox to avoid the selection of the card.

```ts
public alBaseCardConfigIcon: AlBaseCardConfig = {
    toggleable: true,
    toggleableButton: true,
    checkable: false, // Avoids the checkbox.
    hasIcon: true, // Allows to show an icon on the left side
};



public alBaseCardIconItem: AlBaseCardItem = {
    id: '1',
    icon: { name: 'date_range', text: 'Daily' },
    toptitle: 'Title',
    caption: 'Content',
    subtitle: 'Subtitle',
    expanded: false
};

```

## Customizable templates

In some cases, the default view that the card implements is not what it wants to reflect, in these cases it's possible pass a ```ng-template``` with some of the following directives:

* ```alBaseCardHeader```
* ```alBaseCardIcon```
* ```alBaseCardTitle```
* ```alBaseCardCaption```
* ```alBaseCardSubtitle```
* ```alBaseCardHeaderRight```
* ```alBaseCardHeaderExtraContent```
* ```alBaseCardBodyContent```
* ```alBaseCardFooter```

***Note:*** If any of these directives are used, the default view will be omitted for each section.

***Important:*** All directives have attached the context of the item.

### Example

```html
<al-base-card [config]="alBaseCardConfig"
              [item]="alBaseCardItem">
    <!-- let-item allows access to the item -->
    <ng-template alBaseCardHeader let-item>
        Custom Header {{ item | json }}
    </ng-template>
    <ng-template alBaseCardBodyContent let-item>
       Custom Body
    </ng-template>
</al-base-card>
```

## Inputs
 
| Name  | Type | Default | Description |
|-------|------|---------|-------------|
| item |```AlBaseCardItem ```     |```undefined```        | An object with the information to be painted          |
|footerActions       |```AlBaseCardFooterActions```      | ```undefined```         | An object that allows establishing the footer buttons         |
|config       |```AlBaseCardConfig```      | All options are false       | initial card setup              |
|checked       |```boolean```      |```false```         |Allows to change the checkbox state             |

## Outputs
  
| Name | Parameters | Description |
|--|--|--|
| onChangeChecked | ```AlBaseCardItem``` | Emit an event when the checkbox state change |
| onFooterAction | ```AlBaseCardFooterActionEvent``` | Emit an event when user clicks on button footer action. |

## Classes for alBaseCardBodyContent

**Card Body Headers**
* First Header
```html
  <h2 class="first">Card Body Title<h2>
```
* All Other Headers
```html
  <h2>Card Body Title<h2>
```

**Card Body Labels**
```html
  <div class="label">Label</div>
```
**Card Body Descriptions**
```html
  <div class="desc">Description</div>
```


