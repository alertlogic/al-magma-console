# AL Icon Block

A component for displaying icon sections in Alert Logic.

--usage

``` html
-- With material Icon
    <al-icon-block [matIcon]="'add'" [label]="sample"></al-icon-block>

-- Icon using FontAwesome classes

    <al-icon-block [iconClass]="'fa fa-bug'" [label]="sample"></al-icon-block>

--If you have to disable icon-block add property [disabled] ="true"

    <al-icon-block [iconClass]="'fa fa-bug'" [label]="sample" [disabled]="true"></al-icon-block>

```

## Inputs

### icon:string;

The icon name input for icon sets that use ligatures (i.e. Material Icons)

### iconClass:string;

The icon name input for icon sets that use classes (i.e. FontAwesome)

### label:string;

text for the small label under the icon.

## Notes
only use one of these at a time. These input exist in parallel to accomodate FontAwesome icons and Material Icons.