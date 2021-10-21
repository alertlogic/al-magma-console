import * as d3 from 'd3';
import { TopologyNode } from '@al/assets-query';
/**
 *  This is an abstract interface for classes that customize the behavior of the al-environment-topology visualization.
 */
export interface ITopologyTypeBehaviors {
    type: string;
    visible: boolean;
    radius?: number;
    classify?: (node: TopologyNode) => string[];
    linkWidth?: number;
    linkDistance?: number;
    renderOrder?: number;
    state?: (node: TopologyNode) => string;
}

export interface ITopologyBehaviors {
    types: { [typeId: string]: ITopologyTypeBehaviors };
    organizeByType?: string;
    groupByType?: string;
    visualizationClass?: string;
    transitionDuration?: number;
    topLevelNodes?: 'vpcs' | 'regions';
    activateSelector?: boolean;
    availableFlavors?: string[];
    availableAssets?: Array<TopologyNode>;
    enhanceAutoZoom?: boolean;
    state?: (node: TopologyNode) => string;
    classify?: (node: TopologyNode, extras?: {[i: string]: any}) => string[];
    classifyLink?: (source: TopologyNode, target: TopologyNode, extras?: {[i: string]: any}) => string[];
    selectFlavor?: (action: string, actual: string) => string;
    selectPeer?: () => void;
    initialize(state: AlEnvironmentTopologyState, topNodes: any[]): void;
}

export interface ITopologyFocusInfo {
    node: any;
    x: number;
    y: number;
    clientX: number;
    clientY: number;
    activated: boolean;
}

export interface IEnvironmentTopologyView {
    translateX: number;
    translateY: number;
    scale: number;
    autoZoom: boolean;
    focus: ITopologyFocusInfo;
    zoomLevels: number[];
    zoomListener: any;
    previous: any[];
}

export interface IUniverse {
      /* how much to separate each sibling by */
      padding: number;
      // how large to separate suns each other
      radius: number;
      // where the center of the layout should be
      center: any;
      // what angle to start at
      start: number;
      // how much angle partition to share between siblings
      partition: number;
      // How much is it parent-child separation
      rOffset: number;
      // How large is it a planet
      planetRadius: number;
      // How large is radius of the biggest solar system
      outerOrbit: any;
}

export class AlEnvironmentTopologyState {
    public width = 0;
    public height = 0;
    public updateIndex = 0;
    public iteration = 0;
    // This flag should be set to true (using setReloadGraph method) when user changes the deployment
    public reloadGraph = false;

    public viewMode: ViewMode = ViewMode.None;
    public showStoppedInstances = false;
    public correlationMap = {};

    public forceSimulation: any = null;
    public hostExtraInfo: { [i: string]: any; } | undefined;
    public view: IEnvironmentTopologyView = {
        translateX: 0,
        translateY: 0,
        scale: 1.0,
        autoZoom: true,
        focus: {
            node: null,
            x: 0,
            y: 0,
            clientX: 0,
            clientY: 0,
            activated: false
        },
        zoomLevels: [0.05, 0.25, 0.5, 0.75, 1.0, 1.33, 1.75, 2.5],
        zoomListener: null,
        previous: []
    };
    public universe: IUniverse | null = null;
    public selectedNode?: TopologyNode;
    public selectedVpc?: TopologyNode;
}

export interface ITopologyMouseEvent {
    node: any;
    x: number;
    y: number;
    clientX: number;
    clientY: number;
    pageX: number;
    pageY: number;
    extras?: any;
}

export enum ViewMode {
    None = 'none',
    AgentsMap = 'agents_map',
    Lastscan = 'lastScan',
    Credentials = 'credentials',
    RemediationsThreat = 'remediationsAll',
    RemediationsConfigThreat = 'remediationsConfiguration',
    RemediationsSecThreat = 'remedaitionsSecurity',
    IncidentsThreat = 'incidents'
}

export interface ItemsSelectorConfig {
    placeholder: string;
    items: TopologyNode[];
    selectedItems: TopologyNode[] | null;
    labelToBind: string;
    valueToBind: string;
    groupBy: string;
    y: number;
    x: number;
}


export interface SimulationsInternalState {
    graph: d3.Selection<any, any, any, any> | null;
    grouping: { by: string, nodes: d3.Map<any> | null, parents: any[] | null };
    collisionable: any[];
    nodes: any[];
    assetsCountByType?: {[i: string]: number};
    totalNodes: number;
}



