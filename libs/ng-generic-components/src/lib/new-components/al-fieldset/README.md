# al-fieldset 

## Basic Usage
```html
<al2-fieldset legend="Address">
    <al2-input type="text" label="Address Line 1"></al2-input>
    <al2-input type="text" label="Address Line 2"></al2-input>
</al2-fieldset>
```

## Basic Usage - with large legend text
```html
<al2-fieldset legend="Address (Large legend heading)" [legendLarge]="true">
    <al2-input type="text" label="Address Line 1"></al2-input>
    <al2-input type="text" label="Address Line 2"></al2-input>
</al2-fieldset>
```

## Basic Usage - with large legend text
```html
<al2-fieldset legend="Address (with hint and tooltip)" [legendLarge]="true" hint="I am a hint" tip="I am a tooltip">
    <al2-input type="text" label="Address Line 1"></al2-input>
    <al2-input type="text" label="Address Line 2"></al2-input>
</al2-fieldset>
```
