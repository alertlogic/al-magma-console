export interface AlSegment {
    key: string;
    value: any;
    type: string;
    description: string;
    expanded: boolean;
    openChildren?: boolean;
    keypath: string;
    children?: AlSegment[];
}
