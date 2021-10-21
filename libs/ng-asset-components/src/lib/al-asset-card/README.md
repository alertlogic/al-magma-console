# Al Asset Card

## Summary
The asset card displays information related to an assets in the exposures or remediations details view, this component indentifies all properties of the asset and draws the corresponding icon for each one.

# Examples of use

## Basic use

The type AssetDetail is required:

```ts
public myAsset: AssetDetail;
```

Pass the object as the asset propertie:

```html
<al-asset-card [asset]="myAsset"></al-asset-card>
```
