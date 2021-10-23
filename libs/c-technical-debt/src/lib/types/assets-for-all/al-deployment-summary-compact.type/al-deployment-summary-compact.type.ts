/**
 *  DeploymentSummaryCompactDescriptor
 *
 *  @author Julian David <jgalvis@alertlogic.com>
 *
 *  @copyright Alert Logic Inc, 2018
 */
export class DeploymentSummaryCompactDescriptor {

    /**
     * Bottom border color style for the entire component
     * Options: default-line, aws-line, azure-line, datacenter-line
     * Also hexadecimal colors are soported, example: #30aac7
     */
    lineColor: string = "default-line";
    /**
     * Blocks of information to the left of the component
     * Used for positionated a title or a combobox
     */
    infoBlocks: InfoBlocksDescritor[] = [];
    /**
     * Quantity information block to the right of the component
     */
    summaryBlocks: SummaryBlocks[] = [];

    constructor() { }

    /**
     *  import
     *
     *  @param rawData object with the attributes to set the card list
     *  @return Object of type DeploymentSummaryCompactDescriptor
     */
    public import(rawData: any) {

        let item = new DeploymentSummaryCompactDescriptor();

        item.lineColor = rawData.hasOwnProperty('lineColor') ? this.getClassColor(rawData.lineColor) : "default-line";

        if (rawData.hasOwnProperty('summaryBlocks') && Array.isArray(rawData.summaryBlocks)) {
            for (let i = 0; i < rawData.summaryBlocks.length; i++) {
                let block: any;
                block = rawData.summaryBlocks[i].hasOwnProperty('label') ? new SummaryBlocks().import(rawData.summaryBlocks[i]) : new SummaryBlocks();
                item.summaryBlocks.push(block);
            }
        }

        if (rawData.hasOwnProperty('infoBlocks') && Array.isArray(rawData.infoBlocks)) {
            for (let b = 0; b < rawData.infoBlocks.length; b++) {
                let infoBlock: any;
                infoBlock = rawData.infoBlocks[b].hasOwnProperty('infoBlockKey') ? new InfoBlocksDescritor().import(rawData.infoBlocks[b]) : new InfoBlocksDescritor();
                item.infoBlocks.push(infoBlock);
            }
        }

        return item;
    }

    public getClassColor(color: string) {
        switch (color) {
            case 'datacenter':
            case 'aws':
            case 'azure':
                color = color+"-line";
                break;
            default:
                if (!this.isHex(color)) {
                    color = 'default-line';
                }
                break;
        }
        return color;
    }

    // Check if the color is Hexadecimal
    public isHex(color: string) {
        return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color);
    }
    // Get a special css style
    public getBorderColorHex() {
        if (this.isHex(this.lineColor)) {
            return '1px solid ' + this.lineColor;
        }
        return '';
    }

}

export class InfoBlocksDescritor {

    /**
     * Key to identify the block, required*
     */
    infoBlockKey: string = "";
    /**
     * Regular Icon class or Alert Logic Icon Class example: 'al al-subnet' (optional)
     */
    infoBlockIconClass: string = "";
    /**
     * Material icon name example: 'note_add' (Optional)
     */
    infoBlockIconMaterial: string = "";
    /**
     * Default key for auto selecting one option in the combobox (Optional)
     * Used specially when the combobox is requered
     */
    infoBlockOptionDefaultKey: string = "";
    /**
     * Name for displaying above of the infoBlockName or combobox
     */
    infoBlockLabelName: string = "";
    /**
     * Name for displaying if the combobox is not required
     */
    infoBlockName: string = "";
    /**
     * Combobox options
     */
    infoBlockOptions: SelectorOptionDescriptor[] = [];

    constructor() { }

    public import(rawData: any) {
        let selector: InfoBlocksDescritor = new InfoBlocksDescritor();

        selector.infoBlockKey = rawData.hasOwnProperty('infoBlockKey') ? rawData.infoBlockKey : "";
        selector.infoBlockIconClass = rawData.hasOwnProperty('infoBlockIconClass') ? rawData.infoBlockIconClass : "";
        selector.infoBlockIconMaterial = rawData.hasOwnProperty('infoBlockIconMaterial') ? rawData.infoBlockIconMaterial : "";
        selector.infoBlockOptionDefaultKey = rawData.hasOwnProperty('infoBlockOptionDefaultKey') ? rawData.infoBlockOptionDefaultKey : "";
        selector.infoBlockLabelName = rawData.hasOwnProperty('infoBlockLabelName') ? rawData.infoBlockLabelName : "";
        selector.infoBlockName = rawData.hasOwnProperty('infoBlockName') ? rawData.infoBlockName : "";

        if (rawData.hasOwnProperty('infoBlockOptions') && Array.isArray(rawData.infoBlockOptions)) {
            for (let b = 0; b < rawData.infoBlockOptions.length; b++) {
                let option: any;
                option = rawData.infoBlockOptions[b].hasOwnProperty('key') ? new SelectorOptionDescriptor().import(rawData.infoBlockOptions[b]) : new SelectorOptionDescriptor();
                selector.infoBlockOptions.push(option);
            }
        }

        if (selector.infoBlockIconMaterial) {
            selector.infoBlockIconClass = "material-icons";
        }

        return selector;
    }

}

export class SelectorOptionDescriptor {

    /**
     * Name of description to show into the combobox option
     */
    name: string = "";
    /**
     * Key to identify the option
     */
    key: string = "";
    /**
     * Put whatever you want in the object
     */
    data: Object = {};

    constructor() {}

    public import(rawData: any) {
        let option: SelectorOptionDescriptor = new SelectorOptionDescriptor();

        option.name = rawData.hasOwnProperty('name') ? rawData.name : "";
        option.key = rawData.hasOwnProperty('key') ? rawData.key : "";
        option.data = rawData.hasOwnProperty('data') ? rawData.data : {};

        return option;
    }
}

export class SummaryBlocks {

    /**
     * Quantity of the summary block
     */
    quantity: number = 0;
    /**
     * Regular Icon class or Alert Logic Icon Class example: 'al al-subnet'
     */
    iconClass: string = "";
    /**
     * Material icon name example: 'note_add'
     */
    iconMaterial: string = "";
    /**
     * Label description of the summary block
     */
    label: string = "";

    constructor() { }

    /**
     *  import
     *
     *  @param rawData object with the attributes to set the card list
     *  @return Object of type SummaryBlocks
     */
    public import(rawData: any) {

        let item = new SummaryBlocks();

        item.quantity = rawData.hasOwnProperty('quantity') ? rawData.quantity : 0;
        item.iconClass = rawData.hasOwnProperty('iconClass') ? rawData.iconClass : "";
        item.iconMaterial = rawData.hasOwnProperty('iconMaterial') ? rawData.iconMaterial : "";

        if (item.iconMaterial) {
            item.iconClass = "material-icons";
        }

        item.label = rawData.hasOwnProperty('label') ? rawData.label : "";

        return item;
    }
}
