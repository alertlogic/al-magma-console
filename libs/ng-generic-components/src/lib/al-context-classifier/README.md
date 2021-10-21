# al-context-classifier

This component abstracts the programmatic addition/subtraction of CSS classes to elements outside of the 
current component.

## Usage

```
<al-context-classifier
    selector="body div.accordion > span.title"
    class="special-titles"
    [all]="true"></al-context-classifier>
```

The component accepts three inputs.

`selector` - This should be a valid CSS selector.  It will be passed to `document.querySelector()` (or `document.querySelectorAll()`)
to retrieve the elements the CSS class should be applied to.

`class` - This is the CSS class that should be appended to the matching element(s).

`all` - This is a boolean value (default false) that indicates whether all matching elements should be modified,
            or only the first.

In general, `all` should only be set to true in special cases.

## Special Note

Overreliance on this component will have a negative effect on our ecosystem's stylistic integrity.  It should
only be used in rare cases where a global effect can only be triggered from a child element.
