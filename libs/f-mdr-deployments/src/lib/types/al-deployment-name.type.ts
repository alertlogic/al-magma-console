/**
 *  AlDeploymentName
 *
 *  @author Mario Payan <mario.payan@alertlogic.com>
 *
 *  @copyright Alert Logic Inc, 2018
 */

import { AssetWriteDeclareAssetRequestBody } from "@al/assets-query";

/**
 *  AlDeploymentName provides a class to describe show a deployment name
 */
export class AlDeploymentName {
    /**
     *  Text for the label.
     */
    public label?:string = "Deploy";
    /**
     *  define the type of the deploy (aws, azure, datacenter)
     */
    public deployType:string = "default";
    /**
     *  The icon name input
     */
    public matIcon?:string;
    /**
     *  The font size to be used in the label (in px)
     */
    public fontSizeLabel?:string = "16px";
    /**
     *  The font size to be used in the icon (in px)
     */
    public fontSizeIcon?:string = "40px";
    /**
     *  Define if the current icon style is from AL, material or FontAwesome
     */
    public iconClass?:string = "";

    constructor() { }

    /**
     *  Assign some properties according to the incoming values
     */
    public initialize() {
        if (this.matIcon) {
            this.iconClass = "material-icons";
        }
    }
}

export type DeploymentConfigurationNotificationMessage = { text: string, type: 'error' | 'success'};
