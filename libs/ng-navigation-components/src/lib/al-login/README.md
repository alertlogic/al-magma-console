# AlLoginBaseComponent Usage

## Summary

The AlLoginBaseComponent provides a general purpose authentication interface that is backend-agnostic (that is, any user/password authentication scheme can be used).
single utility component with a public API.

## Basic Usage

Embed the component into your view template in the customary way:

```
<al-login-base [useBackground]="expression indicating whether or not to show the background splash screen, which is perdy"
                (authenticate)="handler for authentication event">
</al-login-base>
```


