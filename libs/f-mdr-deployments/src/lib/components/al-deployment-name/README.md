# AL Deployment Name

A component for displaying deployment name section.

![screen shot 2018-08-03 at 5 14 44 pm](https://algithub.pd.alertlogic.net/storage/user/603/files/eb28bc2c-9740-11e8-9101-edba4136d72d)

## Usage

Deployment name should exist inside a block (div, grid, etc.) and should be the only element there

``` Controller
    // Create a new instance of AlDeploymentName
    public alDeploymentName = new AlDeploymentName();

    // Set his attributes according to your needs (should be in ngOnInit)
    this.alDeploymentName.label    = "Example 0";
    this.alDeploymentName.fontSize = 14;
```
``` HTML
    // Define a block (div in this case) and add your al-deployment-name
    <div style="width: 250px; height:100px; padding: 10px; display:inline-block;">
        <al-deployment-name [data]="alDeploymentName"></al-deployment-name>
    </div>
```

## Inputs

### data: AlDeploymentName

Object that contains all the properties related to the AlDeploymentName Component

#### AlDeploymentName.label:string

Text for the label to be used

#### AlDeploymentName.iconMat:string

Icon name to be used.

#### AlDeploymentName.iconClass:string

Icon class to be used.

#### AlDeploymentName.fontSizeLabel:string

The font size to be used in the label

#### AlDeploymentName.fontSizeIcon:string

The font size to be used in the icon