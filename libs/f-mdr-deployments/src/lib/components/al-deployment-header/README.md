# AL Deployment Header Component

A component for displaying a header with some interactive buttons to the right side

### Examples

![image](https://algithub.pd.alertlogic.net/storage/user/277/files/e7f4f202-9afe-11e8-8b6b-ba02546ea1df)
## Usage

Import the class ClasificationFiltersDescriptor and ClasificationDescriptor

```javascript
// import needed descriptors
import { DeploymentHeaderDescriptor, DeploymentButtonDescriptor  } from '../../design';

// define component's raw config
let config = {
    title: 'Header with buttons',
    buttons: DeploymentButtonDescriptor.import([
          {
              label:   "Mine Coins",
              color:   "mat-primary",
              onClick: () => { alert('hola!');}
          },
          {
              label:   "Next",
              color:   "mat-accent",
              onClick: () => { alert('mundo!');}
          }
    ])
};

// instantiate a proper config descriptor for the component
public AlDeploymentHeaderConfig: DeploymentHeaderDescriptor = new DeploymentHeaderDescriptor(config);

```
Html

``` html
<al-deployment-header [config]="AlDeploymentHeaderConfig"></al-deployment-header>
```

## Inputs

### config:DeploymentHeaderDescriptor<sup>*</sup>

Config that defines the custom text and buttons to be displayed in the componnent
