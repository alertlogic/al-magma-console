# al2-radio

## Basic Usage

```typescript
import { AlOptionItem } from '@al/ng-generic-components';

// Setup an array of AlOptionItem objects
public radioOptions: AlOptionItem[] = [
        { label: 'Option One', value: 'one' },
        { label: 'Option Two', value: 'two' },
        { label: 'Option Three', value: 'three' },
        { label: 'Option Four is disabled', value: 'four', disabled: true },
        { label: 'Option Five', value: 'five' }
    ];
```

```html
<al2-radio *ngFor="let item of radioOptions"
    name="radioOptions"
    [value]="item.value"
    [label]="item.label"
    [disabled]="item.disabled">
</al2-radio>
```
