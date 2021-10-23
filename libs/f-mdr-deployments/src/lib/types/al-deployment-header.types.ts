/**
 *  A bunch of classes to describe deployments-related structures.
 *
 *  @author Darwin Garcia <dgarcia@alertlogic.com>
 *
 *  @copyright Alert Logic Inc, 2018
 */


/**
 *  DeploymentButtonDescriptor provides a class to describe any deployment button
 */
export class DeploymentButtonDescriptor {
    /**
     *  Button's label
     */
    public label?: string;
    /**
     *  Button's color'
     */
    public color?: string;
    /**
     *  Button's callback on click
     */
    public onClick?: Function;
    /**
     *  Button's disabled status
     */
    public disabled?: boolean;

    constructor(rawData: any) {
        this.label    = rawData.hasOwnProperty('label') ? rawData.label : "";
        this.color    = rawData.hasOwnProperty('color') ? rawData.color : "mat-primary";
        this.disabled = rawData.hasOwnProperty('disabled') ? rawData.disabled : false;
        this.onClick  = rawData.hasOwnProperty('onClick') ? rawData.onClick : () => { };
    }

    public static import(rawData: any[]) {
        let configs: DeploymentButtonDescriptor[] = [];

        rawData.map(function name(data: any) {
            configs.push(new DeploymentButtonDescriptor(data));
        });

        return configs;
    }

}

/**
 *  DeploymentHeaderDescriptor provides a class to describe any deployment header, along with its
 *  raw properties and annotations.
 */
export class DeploymentHeaderDescriptor {
    /**
     *  Text to display in the header
     */
    public title: string = "";
    /**
     *  Button descriptors for rendering buttons in the right-side area
     */
    public buttons?: Array<DeploymentButtonDescriptor> = [];

    constructor(rawData: any) {
        this.title = rawData.hasOwnProperty('title') ? rawData.title : "";
        this.buttons = rawData.hasOwnProperty('buttons') && Array.isArray(rawData.buttons) ?
            DeploymentButtonDescriptor.import(rawData.buttons) : [];
    }

}
