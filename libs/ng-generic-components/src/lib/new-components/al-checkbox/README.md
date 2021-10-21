# al2-checkbox 

## Basic Usage
```html
<al2-checkbox label="Is Friendly"></al2-checkbox>
```

## Checkbox Group
```typescript
import { AlOptionItem } from '@al/ng-generic-components';

// Setup an array of AlOptionItem objects
public checkboxGroup: AlOptionItem[] = [
        { label: 'Option One', value: 'one' },
        { label: 'Option Two', value: 'two', selected: true },
        { label: 'Option Three', value: 'three' },
        { label: 'Option Four', value: 'four' },
        { label: 'Option Five', value: 'five' }
    ];
```

```html
<al2-checkbox-group
    label="Select Option"
    [options]="checkboxGroup"
    (onChange)="checkboxGroupChange($event)">
</al2-checkbox-group>
```
