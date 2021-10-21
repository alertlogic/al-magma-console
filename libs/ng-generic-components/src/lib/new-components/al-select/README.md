# al-select

## Basic Usage
```typescript
import { AlOptionItem } from '@al/ng-generic-components';

// Setup an array of AlOptionItem objects
public options: AlOptionItem[] = [
        { label: 'Option One', value: 'one' },
        { label: 'Option Two', value: 'two' },
        { label: 'Option Three', value: 'three' },
        { label: 'Option Four is disabled', value: 'four', disabled: true },
        { label: 'Option Five', value: 'five' }
    ];
```

```html
<al2-select label="Select Field" [options]="options"><al2-select>
```

## With Hint Text
```html
<al2-select
    label="Description"
    [options]="radioOptions"
    hint="Give extra information here">
</al2-select>
```

## With Tooltip
```html
<al2-select
    label="Select Option"
    [options]="radioOptions"
    hint="Give extra information here"
    tip="Extra help can go here">
</al2-select>
```

## Marking Required Fields

```html
<al2-select
    label="Select Option"
    [options]="radioOptions"
    required="true">
</al2-select>
```

## Disabled Fields

```html
<al2-select
    label="Select Option"
    [options]="radioOptions"
    disabled="true">
</al2-select>
```
