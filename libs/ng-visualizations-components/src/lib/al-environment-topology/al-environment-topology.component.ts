/* tslint:disable */

import * as d3 from 'd3';
/*  important to import after d3-selection in order to update selection with transition constructs! */
import 'd3-array';
import 'd3-selection';
import 'd3-collection';
import 'd3-quadtree';
import 'd3-transition';
import 'd3-force';
import 'd3-zoom';

import cloneDeep from 'lodash/cloneDeep';

import { NgSelectComponent } from '@ng-select/ng-select';

import { 
    DomSanitizer,
    SafeStyle 
} from '@angular/platform-browser';

import {
    Component,
    ElementRef,
    Input,
    Output,
    EventEmitter,
    OnChanges,
    ViewEncapsulation,
    ViewChild,
    OnDestroy
} from '@angular/core';

import { nestedGet } from '@al/ng-generic-components';

import {
    PhoenixTopologySnapshot,
    TopologyNode,
    TopologyNodeLink,
    AssetTypeDictionary
} from '@al/assets-query';

import {
    AlVisualizationElementDictionary,
} from '../services';

import {
    AlEnvironmentTopologyState,
    ItemsSelectorConfig as NetworkSelectorConfig,
    ITopologyBehaviors,
    ITopologyMouseEvent,
    ITopologyTypeBehaviors,
    SimulationsInternalState,
    ViewMode,
    IVisualizationElement
} from '../types';

@Component({
    selector: 'al-environment-topology',
    templateUrl: './al-environment-topology.component.html',
    styleUrls: ['./al-environment-topology.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AlEnvironmentTopologyComponent implements  OnChanges, OnDestroy {

    @ViewChild('networkSelector') public networkSelector!: NgSelectComponent;

    /**
     * The kind of selector to use (flavor, peer, list or unlink)
     */
    @Input() selector?: string;

    /**
     *  The behavioral rules the graph should follow.
     */
    @Input() behaviors: ITopologyBehaviors | null = null;

    /** When we only need to show the assets in scope */
    @Input() limitToScope = false;

    /**
     *  This required input describes the topology view's data and configuration, filtered and unfiltered.
     */
    @Input() topology: PhoenixTopologySnapshot | null = null;

    /**
     * Whether the graph should be displayed in full screen or not
     */
    @Input() fullScreen = false;

    /**
     *  This output is fired when the user mouses over a specific node in the topology
     */
    @Output() onHoverStart: EventEmitter<ITopologyMouseEvent> = new EventEmitter<ITopologyMouseEvent>();

    /**
     *  This output is fired when the user mouses out of a specific node in the topology
     */
    @Output() onHoverEnd: EventEmitter<ITopologyMouseEvent> = new EventEmitter<ITopologyMouseEvent>();

    /**
     *  This output is fired when the user clicks on a specific node in the topology.
     */

    @Output() onClickedNode: EventEmitter<ITopologyMouseEvent> = new EventEmitter<ITopologyMouseEvent>();

    /**
     *  Theses 2 outputs are fired when the user clicks on the flavor switch for the selected node in the topology.
     */

    @Output() onClickedSelectorSub: EventEmitter<ITopologyMouseEvent> = new EventEmitter<ITopologyMouseEvent>();

    @Output() onClickedSelectorAdd: EventEmitter<ITopologyMouseEvent> = new EventEmitter<ITopologyMouseEvent>();

    /**
     * These outputs are fired when the users clicks to unlink assets for the selected node in the topology
     */
    @Output() onClickedSelectorUnlink: EventEmitter<ITopologyMouseEvent> = new EventEmitter<ITopologyMouseEvent>();

    /**
     * These outputs are fired when the users clicks to list assets for the selected node in the topology
     */
    @Output() onClickedSelectorList: EventEmitter<ITopologyMouseEvent> = new EventEmitter<ITopologyMouseEvent>();

    /**
     * This output is fired when the rendering starts and ends
     */
    @Output() onRendering: EventEmitter<any> = new EventEmitter<any>();

    /**
     * This output is fired when the user clicks on the fullscreen button
     */
    @Output() onFullScreen: EventEmitter<any> = new EventEmitter<any>();

    /**
     * This output is fired when the user uses the selector to change the deployment config
     */
    @Output() onChangesMadeThroughSelector: EventEmitter<any> = new EventEmitter<any>();

    /**
     * Emitted whenever the view (zoom) changes.
     */
    @Output() viewChanged: EventEmitter<any> = new EventEmitter<any>();

    readonly selectorConfig: NetworkSelectorConfig = {
        placeholder: 'search',
        items: [],
        selectedItems: null,
        labelToBind: "name",
        valueToBind: "key",
        groupBy: "deploymentName",
        y: 700,
        x: 800,
    };

    /**
     * A collection of semi-private data that should probably go away or be refactored
     */
    private readonly internal: SimulationsInternalState = {
        graph: null,
        grouping: { by: '', nodes: null, parents: null },
        collisionable: [],
        nodes: [],
        assetsCountByType: {},
        totalNodes: 0,
    };

    private asyncDraw!: NodeJS.Timer;

    private state: AlEnvironmentTopologyState = new AlEnvironmentTopologyState();

    private svg!: d3.Selection<any, any, any, any> | null;

    private readonly forcePadding: number = 5;

    private readonly forceRadius: number = 30;

    private  readonly collisionAssetTypes: string[] =  [...PhoenixTopologySnapshot.extraAssetTypes];

    private readonly defaultTransitionDuration: number = 1500; // milliseconds

    private readonly defaultRadialOffset: number = 250; // degrees

    private readonly halftRotation: number = 180; // degrees

    private readonly maxSupportedNodes: number = 200; // assets

    private readonly maxIterations: number = 400; // ticks

    private readonly defaultLinkDistance: number = 100; // pixels

    private readonly defaultWidth: number = 1280; // pixels

    private readonly defaultHeight: number = 768; // pixels

    private readonly maxCanvasHeight: number = 6000; // pixels

    constructor(protected elementRef: ElementRef,
                protected visualizationElements: AlVisualizationElementDictionary,
                protected sanitizer: DomSanitizer) {
    }

    ngOnDestroy(): void {
        clearTimeout(this.asyncDraw);
    }

    /**
    *  Handle changes to our @Inputs
    */
    ngOnChanges() {
        if (!!this.topology && !!this.behaviors && this.fullScreen !== undefined && this.fullScreen !== null) {
            if (this.selector === 'peer' && this.behaviors.availableAssets && this.behaviors.availableAssets.length > 0) {
                this.selectorConfig.items = this.behaviors.availableAssets;
                this.selectorConfig.selectedItems = null;
            }
            if (this.svg) {
                if (this.state.reloadGraph) { // If there is an entirely new tree
                    /** Dirty moves to load a new tree */
                    this.svg.remove(); // delete current svg instance
                    this.svg = null;
                    this.setSelectedNode();
                    this.draw();
                } else {
                    this.redraw();
                }
            } else {
                this.asyncDraw = setTimeout(() => {
                    this.draw();
                }, 1000);
            }
        }
    }

    /**
     * Public API Methods.
     **/

    /**
     * Forces the graph to refresh.  This is NOT the same as redrawing!
     */
    refresh(): void {
        if (this.internal.graph) {
            this.internal.graph.attr('class', 'topology ' + this.behaviors?.visualizationClass ?? '');
            this.internal.graph.selectAll('g.node').attr('class', (node: any) => this.applyNodeClasses(node));
            this.internal.graph.selectAll('line.link').attr('class', (link: any) => this.applyLinkClasses(link));
        }
    }

    /**
     * Forces the graph to redraw.  The parent component should call this method when it has made changes to nodes that would tangibly
     * effect positioning or display (e.g., changed the type or flavor of a node).
     */
    redraw(): void {
        this.refresh();
        this.paintNodes();
    }

    /**
     * Forces a specific node to be redrawn.
     */
    redrawNode(node: any): void {

        if (!this.internal.graph) {
            console.error("Cannot redraw. internal.graph is null");
            return;
        }

        const nodeSelector = `g.node#node-${node.index}`;
        this.internal.graph.selectAll(`${nodeSelector} > *`).remove();      //  destroy all elements inside the node's group

        const nodeTypeId: string = node.type;
        let typeInfo: ITopologyTypeBehaviors | undefined = this.behaviors?.types[nodeTypeId];
        const flavorId: string = node?.flavor ?? 'default';

        if (!typeInfo) {
            console.error(`behaviors.types.${nodeTypeId} was found to be falsy`);
            return;
        }

        const defaultElement = this.visualizationElements.get(typeInfo.type);
        const flavorElement = this.visualizationElements.get(`${typeInfo.type}/${flavorId}`, null);

        const group = this.internal.graph.selectAll(nodeSelector);
        group.attr('class', (n: any) => this.applyNodeClasses(n));
        this.paintNodeGroup(nodeTypeId, flavorId, typeInfo, group, flavorElement || defaultElement);
    }

    /**
     * Zooms in on a specific node or point.
     *
     * @param {any} target - Either a node which is part of the graph representation OR an object literal with x and y properties.
     * @param {number} scale - The zoom factor to use.  Defaults to *no change* to current zoom level, simply centering on
     *                         the provided coordinates.
     * @param {boolean} setFocus - Indicates whether the zoom state should be "sticky."
     *                             If true, the original view settings will be remembered and can be restored by calling `unzoom`.
     * @param {number} duration - The number of milliseconds to use for transitioning.  Defaults to behavior setting or 500ms.
     */
     zoom(target: any, scale: number = 0, setFocus: boolean = false, duration: number = 0): void {
        if (!this.svg) {
            console.error("Cannot zoom. svg property is null");
            return;
        }
        let tx = this.state.view.translateX;
        let ty = this.state.view.translateY;
        scale = scale || this.state.view.scale;
        if (target && setFocus) {
            this.state.view.previous.push({
                translateX: this.state.view.translateX,
                translateY: this.state.view.translateY,
                scale: this.state.view.scale
            });
            if (!target.hasOwnProperty('x') || !target.hasOwnProperty('y')) {
                throw new Error('Invalid usage: zoom cannot be called on a target without \'x\' and \'y\' properties.');
            }
            //  Calculate the upper left coordinate of the view area that will center the focused node at the target scale
            // console.log("Target is at %s,%s", target.x, target.y );
            tx = (this.state.width / 2) - (target.x * scale);
            ty = (this.state.height / 2) - (target.y * scale);
            // console.log("Zoom starting with target (%s,%s) @ %s!", tx, ty, scale );
        }
        duration = duration || this.behaviors?.transitionDuration || this.defaultTransitionDuration;

        const targetTransform = d3.zoomIdentity.translate(tx, ty).scale(scale);

        this.svg.transition()
            .duration(duration)
            .call(this.state.view.zoomListener.transform, targetTransform);
    }

    /**
     * Cancels an active zoom state, reverting to the previous scale and focus.
     */
    unzoom(duration: number = 0): void {
        if (!this.svg) {
            console.error("Cannot unzoom. svg property is null");
            return;
        }
        if (this.state.view.previous.length) {
            duration = duration || this.behaviors?.transitionDuration || this.defaultTransitionDuration;
            let restore = this.state.view.previous.pop();
            // console.log("Restoring original zoom (%s,%s) @ %s", restore.translateX, restore.translateY, restore.scale );
            const targetTransform = d3.zoomIdentity.translate(restore.translateX, restore.translateY).scale(restore.scale);
            this.svg.transition()
                .duration(duration)
                .call(this.state.view.zoomListener.transform, targetTransform);
        }
    }


    /**
     *  Walks to the next zoom level in permitted zoom levels
     *  This function is used in zoom-in event of the controller
     */
    zoomIn(): void {
        if (!this.svg) {
            console.error("Cannot zoom in. svg property is null");
            return;
        }
        let scale: number = this.state.view.scale;
        for (let i = 0; i < this.state.view.zoomLevels.length; i++) {
            if (this.state.view.zoomLevels[i] > scale) {
                scale = this.state.view.zoomLevels[i];
                break;
            }
        }

        const duration: number = this.behaviors?.transitionDuration || this.defaultTransitionDuration;
        const targetTransform = d3.zoomIdentity.scale(scale);
        this.svg.transition()
            .duration(duration)
            .call(this.state.view.zoomListener.transform, targetTransform);
    }

    /**
     *  Walks to the former zoom level in permitted zoom levels
     *  This function is used in zoom-out event of the controller
     */
    zoomOut(): void {
        if (!this.svg) {
            console.error("Cannot zoom out. svg property is null");
            return;
        }
        let scale = this.state.view.scale;
        for (let i = this.state.view.zoomLevels.length - 1; i >= 0; i--) {
            if (this.state.view.zoomLevels[i] < scale) {
                scale = this.state.view.zoomLevels[i];
                break;
            }
        }

        const duration = this.behaviors?.transitionDuration || this.defaultTransitionDuration;
        const targetTransform = d3.zoomIdentity.scale(scale);
        this.svg.transition()
            .duration(duration)
            .call(this.state.view.zoomListener.transform, targetTransform);
    }

    /**
     * Returns the node representation of asset the key provided
     * @param {string} key
     * @returns {any} The node if found, otherwise an empty object
     */
    getNodeByKey(key: string): any {
        const nodes = this.state.forceSimulation.nodes();
        for (let i = 0; i < nodes.length; i++) {
            if (key === nodes[i].key) {
                return nodes[i];
            }
        }
        return {};
    }

    toggleFullScreen(): void {
        this.onFullScreen.emit();
    }

    setReloadGraph(reload = false) {
        this.state.reloadGraph = reload;
    }

    setTree(tree: PhoenixTopologySnapshot) {
        this.topology = tree;
        this.ngOnChanges();
    }

    setViewMode(mode: ViewMode = ViewMode.None) {
        this.state.viewMode = mode;
    }

    setHostExtraInfo(info: {[i: string] : any}) {
        this.state.hostExtraInfo = info;
    }

    setShowStoppedInstances(show = false) {
        this.state.showStoppedInstances = show;
    }

    getShowStoppedInstances() {
        return this.state.showStoppedInstances;
    }

    getState() {
        return this.state;
    }

    setCorrelationMap(map = {}) {
        this.state.correlationMap = map;
    }

    getViewMode(): ViewMode {
        return this.state.viewMode;
    }

    setSelectedNode(node?: TopologyNode) {
        this.state.selectedNode = node;
    }

    getSelectedNode(): TopologyNode | undefined {
        return this.state.selectedNode;
    }

    onNetworkSelect(network: TopologyNode): void {
        if (!this.topology || !this.state?.selectedNode) {
            console.error("onNetworkSelect fatal error. topology or state.selectedNode is null");
            return;
        }
        if (network.deploymentId === this.topology.deploymentId) {
            network = this.topology.getByKey(network.key);
            network.flavor = 'peered';
        }
        this.state.selectedVpc = network;
        this.selector = 'unlink';
        // We fake a peering flavor so we can reuse the existing logic
        this.state.selectedNode.flavor = 'peering';
        if (this.state.selectedNode.type === 'region') {
            this.state.selectedNode.peeredTo = this.state.selectedVpc;
            this.state.selectedNode
                .children.forEach(child => {
                    if (this.state?.selectedVpc) {
                        this.state.selectedVpc.peeredFrom.push(child);
                        child.peeredTo = this.state.selectedVpc;
                        child.flavor = 'peering';
                    }

                });
        } else if (this.state.selectedNode.type === 'vpc') {
            this.state.selectedNode.peeredTo = this.state.selectedVpc;
        }
        this.selectorConfig.selectedItems = null;
        this.selectorConfig.items = this.behaviors?.availableAssets ?? [];
        this.onChangesMadeThroughSelector.emit(this.state.selectedNode);

        this.redraw();
    }

    getTransformForSelector(): SafeStyle {
        const tx = this.state.view.translateX;
        const ty = this.state.view.translateY;
        const x = this.selectorConfig.x;
        const y = this.selectorConfig.y;
        const s = this.state.view.scale;

        const trans = `translate(${tx}px, ${ty}px) scale(${s}) translate(${x}px, ${y}px)`;
        return this.sanitizer.bypassSecurityTrustStyle(trans);
    }

    shouldDisplayNetworkSelector(): boolean {
        return !!this.state.selectedNode &&
               this.state.selectedNode.flavor !== 'peering' &&
               this.selector === 'peer';
    }

    private getProtectionLevelSelectorLabelText = (flavorName: string): string => {
        if (flavorName.includes("-")) {
            flavorName = "PROTECTED";
        } else {
            flavorName = flavorName.toUpperCase();
        }
        return flavorName;
    }

    draw(): void {
        try {
            if (!this.topology || !this.behaviors) {
                return;
            }
            if (!this.svg) {
                if (!this.initializeSVG()) {
                    return;
                }
            }

            /* We'll invent a "fake" root node, since PhoenixTopologySnapshot doesn't provide one (shiftyeyes) */
            const root = new TopologyNode();
            root.type = 'root';
            root.key = '/environment/root';
            const topLevelNodes: TopologyNode[] | null = this.behaviors.topLevelNodes ? this.getTopLevelNodesFromTopology() : null;
            if (topLevelNodes) {
                // If topLevelNodes provided in behavior and PhoenixTopologySnapshot has data available for it, then use them as 'suns'
                root.children = topLevelNodes.map((asset) => {
                    asset.parent = null; // 'suns' don't have parents ;)
                    return asset;
                });
            } else {
                // By default use regions as 'suns'
                root.children = this.topology.regions;
                // In order to support asset organization by VPC, Subnet, Region
                this.behaviors.organizeByType = this.behaviors.organizeByType || 'region';
            }
            this.internal.grouping.parents = root.children;
            this.synchronizeGraph(root);

            // Tell the component to not reload (return the flag to default state)
            this.setReloadGraph();
        } catch (e) {
            console.error('Failed to redraw: ' + e.toString(), e);
        }
    }

    private shouldInclude(node: TopologyNode): boolean {
        //  eliminate nodes that aren't configured for display
        if (!this.behaviors?.types.hasOwnProperty(node.type)) {
            return false;
        }
        if (node.type === 'host' && !this.state.showStoppedInstances) {
            if (this.state.hostExtraInfo && this.state.hostExtraInfo[node.key] && this.state.hostExtraInfo[node.key].state === 'stopped') {
                return false;
            }

        }
        if (this.limitToScope) {
            if (!node.properties['in_scope']) {
                let inScope = false;

                // Simulate in_scope flag value as it should be retrieved by topology endpoint
                // Take in_scope value from parent whenever the asset belongs to correlated types
                if (this.collisionAssetTypes.indexOf(node.type) >= 0) {
                    inScope = !!(node.parent && node.parent.properties['in_scope']);
                }
                return inScope;

            } else {
                return !!node.properties['in_scope'];
            }
        }
        if (!this.behaviors.types[node.type].visible) {
            return false;
        }
        return true;
    }

    private flattenNodes(tree: TopologyNode): TopologyNode[] {
        const uniqueValues = d3.map();
        let forceNodes;

        const self = this;
        const traverser = (node: TopologyNode, level: number) => {
            if (!self.shouldInclude(node)) {
                return;
            }
            const _node = <any>node;
            if (_node._node_index === undefined) {
                _node._node_index = uniqueValues.size();
            }
            uniqueValues.set(node.key, node);
            _node._update_index = this.state.updateIndex;
            _node._level = level;
            for (let i = 0; i < node.children.length; i++) {
                traverser(node.children[i], level + 1);
            }
        };
        for (let i = 0; i < tree.children.length; i++) {
            traverser(tree.children[i], 0);
        }

        forceNodes = uniqueValues.values();

        /* sort by nodes's tree level to modify the rendering order */
        forceNodes.sort((a, b) => b._level - a._level);

        return forceNodes;
    }

    /**
     *  Transforms the data tree into an array of links
     *  Data model is a tree but force directed layout requires an array of links
     */
    private flattenLinks(tree: TopologyNode): TopologyNodeLink[] {
        const forceLinks: TopologyNodeLink[] = [];
        const self = this;
        const traverser = function (node: TopologyNode) {
            for (let i = 0; i < node.children.length; i++) {
                if (!self.shouldInclude(node.children[i])) {
                    return;
                }
                if (node.children[i].parent === node || self.collisionAssetTypes.indexOf(node.children[i].type) !== -1) {
                    forceLinks.push({ source: node, target: node.children[i] });
                }
                traverser(node.children[i]);
            }
        };
        for (let i = 0; i < tree.children.length; i++) {
            traverser(tree.children[i]);
        }
        return forceLinks;
    }

    /**
     *  Applies CSS basic classes to nodes in SVG canvas
     */
    private applyNodeClasses(node: any): string {
        let classes = ['node', node.type];
        if (node.flavor) {
            classes.push(node.flavor);
        } else {
            classes.push('default');
        }
        classes.push(node._update_index === this.state.updateIndex ? 'active' : 'defunct');
        if (this.behaviors?.types.hasOwnProperty(node.type) && typeof this.behaviors.types[node.type].classify === 'function') {
            const behaviorType: ITopologyTypeBehaviors = this.behaviors.types[node.type];
            if (typeof (behaviorType?.classify) === 'function') {
                classes = classes.concat(behaviorType.classify(node));
            }
        } else if (typeof this.behaviors?.classify === 'function') {
            classes = classes.concat(this.behaviors.classify(node, {
                'selectedNode': this.state.selectedNode,
                'viewMode': this.state.viewMode,
                'hostExtraInfo': this.state.hostExtraInfo,
                'showStoppedInstances': this.state.showStoppedInstances
            }));
        }
        return classes.join(' ');
    }

    /**
     *  Applies CSS basic classes to links in SVG canvas
     */
    private applyLinkClasses(link: TopologyNodeLink): string {
        let classes = ['link', link.target.type];

        if (typeof (this.behaviors?.classifyLink) === 'function') {
            if (this.state.viewMode !== ViewMode.None) {
                classes = classes.concat(this.behaviors.classifyLink(link.source, link.target, { 'viewSource': this.state.viewMode }));
            } else {
                classes = classes.concat(this.behaviors.classifyLink(link.source, link.target, { 'selectedNode': this.state.selectedNode }));
            }
        }

        return classes.join(' ');
    }

    /**
     * This function is key to tell when topology should be repainted:
     *
     * - on first rendering
     * - on asset counting by type changed
     * - on grouping nodes changed
     *
     * @param nodes The incoming data to be compared against current data.
     * @returns {boolean} True for yes, something is changed! False otherwise.
     */
    private hasDataChanged(nodes: any[]): boolean {
        const groupingNodes = d3.map();
        const assetsByType: { [i: string]: number } = {};
        let changeDetected = false;
        const typeID: string = this.behaviors?.organizeByType ?? 'region';

        this.internal.assetsCountByType = this.internal?.assetsCountByType ?? {};

        // Selects the top level nodes for grouping by
        nodes.forEach((node) => {
            if (node.type === typeID) {
                groupingNodes.set(node.key, node);
            }
            assetsByType[node.type] = assetsByType[node.type] || 0;
            assetsByType[node.type]++;
        });

        // If state is NULL, it's the first rendering then
        if (this.internal.grouping.nodes === null) {
            this.internal.grouping.nodes = d3.map();
            changeDetected = true;
        }

        // Not the first rendering? ok...

        // Check for changes on group members
        if (!changeDetected) {
            if (this.internal.grouping.nodes.size() !== groupingNodes.size()) {
                changeDetected = true;

            } else {
                const keys = groupingNodes.keys();
                for (let k = 0; k < keys.length; k++) {
                    if (!this.internal.grouping.nodes.has(keys[k])) {
                        changeDetected = true;
                        break;
                    }
                }
            }
        }

        // No change on group members? ok...

        // Check for changes on assets counting
        if (!changeDetected) {

            const assetTypes = Object.keys(assetsByType);

            changeDetected = (assetTypes.length !== Object.keys(this.internal.assetsCountByType).length);

            for (let t = 0; t < assetTypes.length; t++ && !changeDetected) {
                if (this.internal.assetsCountByType[assetTypes[t]] !== assetsByType[assetTypes[t]]) {
                    changeDetected = true;
                }
            }
        }

        // Check if full reload graph was requested
        if (this.state.reloadGraph === true) {
            changeDetected = true;
        }

        if (changeDetected) {
            // Save current configuration
            this.internal.grouping.by = typeID;
            this.internal.grouping.nodes = groupingNodes;
            this.internal.assetsCountByType = assetsByType;
        }

        return changeDetected;

        // At this point, keep the status quo ;)
    }


    /**
    *  Computes the positioning system for the universe layout
    *  This function calculates the orbits for every single solar system and
    *  performs the big-bang calculation for optimise distances avoiding solar systems overlapping
    *  @param {Map} topLevelNodes It is a D3 map containing grouping level nodes as "region", "vpc"...
    */
    private setUniverse(topLevelNodes: d3.Map<any>): void {
        if (!this.internal.grouping.parents) {
            console.error("Cannot set universe. internal.grouping.parents is null");
            return;
        }
        const center = { x: this.state.width / 2, y: this.state.height / 2, key: 'center' };

        /* Default values for Galaxy's Suns */
        const orbitInfo = this.state.universe = {
            /* how much to separate each sibling by */
            padding: 5,
            // how large to separate suns each other
            radius: 250,
            // where the center of the layout should be
            center: center,
            // what angle to start at
            start: 0,
            // how much angle partition to share between siblings
            partition: 360,
            // How much is it parent-child separation
            rOffset: 250,
            // How large is it a planet
            planetRadius: 20,
            // How large is radius of the biggest solar system
            outerOrbit: { last: 0 }
        };

        /**
         * Extract the root parents (regions) of the universe
         */
        const rootParents = d3.map();
        const filterRootParents = (d: any) => {

            if (d.parent && d.parent !== null) {
                filterRootParents(d.parent);
            } else {
                rootParents.set(d.key, { source: center, target: d });
            }

        };

        if (this.behaviors?.organizeByType === this.behaviors?.groupByType) {
            this.internal.grouping.parents.forEach(filterRootParents);
        } else {
            topLevelNodes.values().forEach(filterRootParents);
        }

        /**
         * Creates the center of the universe with root parents as main stars
         * This part is useful when grouping by asset is activated
         */
        if (!rootParents.empty()) {

            let groupBy, o;
            const root = {
                _orbit: {
                    center: center,
                    radius: 50,
                    angle: 0,
                    delta: 360
                },
                key: 'root',
                children: rootParents.values(),
                links: rootParents.values(),
                x: center.x,
                y: center.y
            };

            groupBy = (topLevelNodes.values()[0]) ? topLevelNodes.values()[0].type : this.behaviors?.organizeByType;
            o = { ...{}, ...orbitInfo };

            this.setOrbitalPosition(rootParents, o);
            this.createSolarSystem(root, { ...{}, ...o }, groupBy);

        }

        /**
         * Here is when god says: "Let there be light"
         * Then a solar system is created for every single top-level node as sun
         */
        topLevelNodes.values().forEach((d: any) => {
            this.createSolarSystem(d, orbitInfo, this.behaviors?.groupByType ?? '');
        });

        /**
         * Finally, solar systems are separated by the huge force of creation
         * And so avoid the overlapping of living things
         * Note: asteroids (correlated types) come later on then tick function
         */
        this.bigBang(topLevelNodes);

    }

    /**
     *  Creates concentric circular locations for the provided nodes
     *  This is used in ticks for moving up 'group by' nodes to circular positions.
     */

    private setOrbitalPosition = (planets: any, o: any) => {

        const padding = o.padding;
        const deltaS = (2 * o.planetRadius + padding);
        let current = o.start,
            radius = o.radius,
            deltaAngle = (deltaS / radius) * (180 / Math.PI),
            maxSlots = Math.floor(o.partition / deltaAngle),
            counter = 0;
        // Angle portion to be used for a single node
        const nextSlot = () => {

            // round started? create a new sub-orbit
            if (counter % maxSlots === 0) {

                radius += (counter > 0) ? deltaS : 0;
                deltaAngle = (deltaS / radius) * (180 / Math.PI);
                maxSlots = Math.floor(o.partition / deltaAngle);

                /* Is there enough bins for remaining siblings? */
                if ((planets.size() - counter) < maxSlots) {
                    deltaAngle = o.partition / (planets.size() - counter);
                    current = (planets.size() > 1) ? o.start : o.start + (o.partition / 2);

                } else {
                    current = o.start;
                }

                counter = 0;

            } else {
                current += deltaAngle;
            }

            counter++;

            return { radius: radius, angle: current, delta: deltaAngle };
        };


        const isPlanet = (node: any): boolean => {
            const isAsteroid = this.collisionAssetTypes.indexOf(node.type) !== -1;
            return !isAsteroid && (planets.has(node.key) || planets.hasOwnProperty(node.key));
        };

        this.state.forceSimulation.nodes().filter(isPlanet).forEach((planet: any) => {

            const slot = nextSlot();

            /**
             * Given a central point (sun), an angle, and a orbital radius,
             * save that info into the node for further positioning calculations
             */
            planet._orbit = {
                center: o.center,
                radius: slot.radius,
                angle: slot.angle,
                delta: slot.delta
            };

        });

        // Update maximum radius
        if (o.center._orbit) {
            o.center._orbit.outerRadius = o.center._orbit.outerRadius || 0;
            o.center._orbit.outerRadius = Math.max(radius, o.center._orbit.outerRadius);
        }

        return planets.values();
    }

    /**
      * Creates a solar system centered in the provided node (the sun)
      * It requires that setOrbitalPosition were previously applied to sun's siblings, included himself.
      * @param {any} sun The node representing the sun (parent node)
      * @param {any} orbitInfo The settings for the orbit
      * @param {string} [groupBy] Optional asset type as stop criteria for classification.
      */
    private createSolarSystem = (sun: any, orbitInfo: any, groupBy: string): void => {

        const planetsPerOrbit: any[] = [];

        /**
         * Classification by orbit level
         * This function assigns every single node to an orbit level recursively
         *
         * @param {any} node parent node
         * @param {integer} orbitLevel level of parent node
         */
        const classifyOrbit = (node: any, orbitLevel: number): void => {
            const childrenProperty = 'links';
            if (node[childrenProperty] && node.type !== groupBy) {
                node[childrenProperty].forEach((v: any) => {
                    const child = v.target;
                    if (!child) {
                        console.log('parent node ', node);
                        console.log('group by ', groupBy);
                    }
                    planetsPerOrbit[orbitLevel] = planetsPerOrbit[orbitLevel] || d3.map();
                    planetsPerOrbit[orbitLevel].set(child.key, child);
                    classifyOrbit(child, orbitLevel + 1);
                });
            }
        };
        /**
         * Clustering of nodes belonging to same orbit level
         * This function creates clusters of nodes grouped by parent
         *
         * @param {d3.Map} planets D3 map containing entries asset key -> node
         */
        const clustering = (planets: d3.Map<any>): d3.Map<any> => {
            const clusters = d3.map();
            planets.each((v: any, k: any) => {
                const parent = (v.parent) ? v.parent : v;
                if (!clusters.has(parent.key)) {
                    clusters.set(parent.key, { parent: parent, siblings: d3.map() });
                }
                clusters.get(parent.key).siblings.set(k, v);
            });
            return clusters;
        };

        /**
         * Here starts the magic with the sun of this solar system
         * at orbit level 0
         */
        classifyOrbit(sun, 0);
        /**
         * Stores the orbital information within every single node in solar system
         * Once the classification is completed, it walks across orbits then
         * make clusters of siblings and finally sets the orbital info for them
         */
        planetsPerOrbit.forEach((planets, index) => {
            orbitInfo.radius = orbitInfo.rOffset + (index * orbitInfo.rOffset);
            orbitInfo.center = sun;
            const clusters = clustering(planets);
            clusters.each((cluster, key) => {
                if (!cluster.parent) {
                    console.error("cluster without parent ", cluster);
                }
                const first = index === 0;
                const parentOrbit = cluster.parent._orbit || { angle: 0, delta: 360 };
                orbitInfo.start = first ? parentOrbit.angle : parentOrbit.angle - (parentOrbit.delta / 2);
                orbitInfo.partition = (first && cluster.siblings.size() > 1) ? 360 : parentOrbit.delta;
                this.setOrbitalPosition(cluster.siblings, orbitInfo);
            });
        });
    }



    /**
    * Separates solar systems each other to avoid overlapping
    * This function uses the big-bang as metaphor for separation
    * of solar systems by repealing suns each other
    * @param {Map} sunNodes D3 map containing the nodes used as centers of solar systems
    * @param {number} iteration
    * @returns {Map} same nodes passed as argument
    */
    private bigBang = (sunNodes?: d3.Map<any>, iteration?: number): d3.Map<any> | undefined => {
        if (!this.internal.grouping.nodes) {
            console.error("Cannot big bang. internal.grouping.nodes is null");
            return;
        }
        sunNodes = sunNodes || this.internal.grouping.nodes;
        iteration = iteration || 0;

        let overlaps = 0;
        const neighbors = sunNodes.values();
        const self = this;
        const getLocation = function (a: any) {
            const o = a._orbit;
            return {
                x: (o.center.x + o.radius * Math.cos(o.angle * Math.PI / 180)),
                y: (o.center.y + o.radius * Math.sin(o.angle * Math.PI / 180)),
                radius: Math.max(o.outerRadius, self?.state?.universe?.outerOrbit['last'])
            };
        };

        const orbitsColliding = function (a: any, b: any) {
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const radii = a.radius + b.radius + self?.state?.universe?.padding;
            return (dx * dx) + (dy * dy) < (radii * radii);
        };

        for (let k = 0; k < neighbors.length; k++) {
            const sun = neighbors[k];
            let hasNearNeighbor = false;

            for (let i = 0; (i < neighbors.length) && !hasNearNeighbor; i++) {
                if (neighbors[i].key !== sun.key) {
                    hasNearNeighbor = orbitsColliding(getLocation(sun), getLocation(neighbors[i]));
                }
            }

            if (hasNearNeighbor) {
                sun._orbit.radius += self?.state?.universe?.rOffset;
                overlaps++;
            }
        }

        return overlaps > 0 && iteration < 10 ? this.bigBang(sunNodes, iteration + 1) : sunNodes;
    }

    /*
     *  Loads the data and configuration
     *  This synchronize data in the graph view
     */
    private synchronizeGraph(dataTree: TopologyNode): void {

        this.state.updateIndex++;        // keep track on which update cycle we're in
        this.state.iteration = 0;        // keep track on how many iterations have been made in current cycle
        this.internal.totalNodes = 0;       // keep track on how many nodes are in topology in current cycle


        if (this.behaviors?.initialize) {
            this.behaviors.initialize(this.state, dataTree.children);
        }

        // Converts incoming data from node-tree to node-array
        let nodes: TopologyNode[] = this.flattenNodes(dataTree);
        const links: { source: TopologyNode, target: TopologyNode }[] = this.flattenLinks(dataTree);
        let self = this;
        if (this.hasDataChanged(nodes)) {
            if (!this.internal.grouping.nodes) {
                console.error("Cannot synchronize graph. internal.grouping.nodes is null");
                return;
            }

            self = this;

            // Sets the data into the d3 model and paints both nodes and links
            this.setLinks(links);
            this.setNodes(nodes);

            this.setUniverse(this.internal.grouping.nodes);
            // Initializes orbital positioning of nodes
            nodes.forEach((d: any) => {
                if (d._orbit && d._orbit.center) {
                    const o = d._orbit;
                    d.x = d.px = o.center.x + o.radius * Math.cos(o.angle * Math.PI / 180);
                    d.y = d.py = o.center.y + o.radius * Math.sin(o.angle * Math.PI / 180);
                } else if (d._outerOrbit) {
                    d._outerOrbit = undefined;
                }
                this.internal.totalNodes++;
            });

            // Filters only collisionable nodes (correlated asset types)
            this.internal.collisionable = nodes.filter((d) => {
                return self.collisionAssetTypes.indexOf(d.type) !== -1;
            });

            // Separates solar systems each other
            this.bigBang();

            /*
            *  Collision detection method applied during animation to avoind nodes overlapping
            */
            const collide = (alpha: number) => {
                const quadtree = d3.quadtree()
                    .x((node: any) => node.x)
                    .y((node: any) => node.y)
                    .addAll(this.internal.collisionable);
                return (d: any) => {
                    const rb = self.forceRadius + 2 * self.forcePadding,
                        nx1 = d.x - rb,
                        nx2 = d.x + rb,
                        ny1 = d.y - rb,
                        ny2 = d.y + rb;
                    quadtree.visit((quad: any, x1: number, y1: number, x2: number, y2: number) => {
                        if (!quad.length) {
                            do {
                                if (quad['data'].x !== d.x && quad['data'].y !== d.y) {
                                    let x = d.x - quad['data'].x,
                                        y = d.y - quad['data'].y,
                                        l = Math.sqrt(x * x + y * y);
                                    if (l < rb) {
                                        l = (l - rb) / l * alpha;
                                        x *= l;
                                        y *= l;
                                        quad['data'].x += x;
                                        quad['data'].y += y;
                                        d.x -= x;
                                        d.y -= y;
                                    }
                                }
                            } while (quad = quad['next']);
                        }
                        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
                    });
                };
            };

            /**
           * Provides the node positioning calculator function based on pre-computed universal orbits
           * This function uses the universe layout as basis of positioning system
           */
            const moveToOrbital = (alpha: number) => {
                const distance = (a: any, b: any) => {
                    return Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y));
                };
                /**
                 * Returns the corresponding orbit radius for provided node
                 * @param  d The node
                 * @returns  The radius
                 */
                const getOuterOrbitRadius = (d: any): number => {
                    const sun = nestedGet(d, 'parent.parent.parent', undefined) || { key: 'default' },
                        o = this.state?.universe?.outerOrbit || {},
                        delta = this.forceRadius + 2 * this.forcePadding,
                        offset = 0.5 * (this.state.universe?.rOffset ?? this.defaultRadialOffset);

                    o[sun.key] = o[sun.key] || { 'offset': 0 };

                    if (!o[sun.key].hasOwnProperty(d.type)) {
                        o[sun.key][d.type] = { asteroids: 0 };
                        o[sun.key][d.type].offset = offset + o[sun.key].offset;
                        o[sun.key].offset += delta;
                    }

                    if ((o[sun.key][d.type].asteroids++) % 20 === 0) {
                        o[sun.key][d.type].offset += delta;
                        o[sun.key].offset += delta;
                    }

                    return o[sun.key][d.type].offset;
                };

                /**
                 * Finds the root ancestor for provided node
                 * @param {any} d The child node
                 * @returns {any} The root ancestor, aka the sun
                 */
                const getSun = (d: any): any => {

                    if (this.internal.grouping.by === d.type) {
                        return d;
                    }

                    if (d.parent) {
                        return getSun(d.parent);
                    } else {
                        d._orbit = d._orbit || { x: 0, y: 0, outerRadius: 0 };
                        return d;
                    }
                };

                /**
                 * Calculates both orbit and position for provided node
                 * This function is used when NO pre-calculated orbit info is present into the node
                 * @param {any} d The node
                 */
                const moveToOuterOrbit = (d: any): void => {
                    let o = d._outerOrbit;
                    let radius: number;

                    if (!o || o.center.type !== this.internal.grouping.by) {
                        o = d._outerOrbit = { center: getSun(d) };
                        o.radius = o.center._orbit.outerRadius + getOuterOrbitRadius(d);
                        d.x = o.center.x + o.radius * Math.cos(d.parent._orbit.angle * Math.PI / this.halftRotation);
                        d.y = o.center.y + o.radius * Math.sin(d.parent._orbit.angle * Math.PI / this.halftRotation);
                    }

                    radius = distance(d, o.center);

                    d.x = o.center.x + ((o.radius * (d.x - o.center.x)) / radius);
                    d.y = o.center.y + ((o.radius * (d.y - o.center.y)) / radius);

                };

                /**
                 * Calculates the position for provided node
                 * This function is used when pre-calculated orbit info is present into the node
                 * @param {any} d The node
                 */
                const moveToOrbit = (d: any): void => {
                    const o = d._orbit;

                    if (d._orbit.center) {
                        d.x += ((o.center.x + o.radius * Math.cos(o.angle * Math.PI / this.halftRotation)) - d.x) * alpha;
                        d.y += ((o.center.y + o.radius * Math.sin(o.angle * Math.PI / this.halftRotation)) - d.y) * alpha;

                    } else {
                        moveToOuterOrbit(d);
                    }
                };

                return (d: any): void => {
                    if (!d.fixed) {
                        return (d._orbit) ? moveToOrbit(d) : moveToOuterOrbit(d);
                    }
                };
            };
            /*
               *  Executes animation clock ticks controlled by force-directed layout
               *  This is the core of the animation where all the forces in graph are calculated
               *  and nodes are repositioned according to that forces
           */
            const onTickCallback = (): void => {
                this.state.iteration++;

                /* Detect collisions to avoid nodes overlapping */
                this.internal.collisionable.forEach(collide(0.07));

                /* Set orbital positioning dynamically */
                this.internal.nodes.forEach(moveToOrbital(1.0));

                /* Move nodes and links to calculated positions */
                this.updateNodesPosition();
                this.updateLinksPosition();

                if (this.internal.totalNodes > this.maxSupportedNodes ||
                    this.state.iteration > this.maxIterations) {
                    console.warn(`Simulation forcibly stopped. ` +
                        `Total nodes: ${this.internal.totalNodes}, Iteration: ${this.state.iteration}`);
                    this.state.forceSimulation.stop();
                    this.automaticZoom();
                    this.onRendering.emit('end');
                }
            };
            this.onRendering.emit('start');
            this.state.forceSimulation.on('tick', onTickCallback);
            this.state.forceSimulation.on('end', () => {
                this.automaticZoom();
                this.onRendering.emit('end');
            });

        }
    }

    /**
     *  Appends DOM elements for every single node in force-directed layout
     */
    private setNodes(nodes: any[]): void {
        if (!this.internal.graph) {
            console.error("Cannot set nodes. internal.graph is null");
            return;
        }
        this.internal.nodes = nodes;

        /**
         * By sorting the nodes makes universe layout algorithm assigns same positions
         * for same nodes, avoiding jumps between subsequent renderings.
         */
        this.state.forceSimulation.nodes(nodes.sort((a, b) => a.index - b.index));

        /**
         * Remove SVGs an recreate them with the new incomimng data.  Is there a less CPU intensive way to do this?
         */
        this.internal.graph.selectAll('g.node').remove();

        const nodeGroup = this.internal.graph.selectAll('g.node').data(nodes);
        nodeGroup.enter()
            .append('g')
            .attr('class', (node: any) => this.applyNodeClasses(node))
            .attr('id', (node: any) => `node-${node.index}`);

        nodeGroup.exit().remove();

        //  Paints the nodes of different types
        this.paintNodes();

        // Sets event listeners for interactions with nodes
        this.registerNodeEventListeners();
    }

    /**
     *  Appends DOM elements for every single link in force-directed layout
     */
    private setLinks(links: any[]): void {
        if (!this.internal.graph) {
            console.error("Cannot set links. internal.graph is null");
            return;
        }
        const self = this;

        const linkForce = d3.forceLink(links)
            .distance(link => {
                const target = <any>link.target;
                if (!(self.behaviors?.types ?? {}).hasOwnProperty(target.type)) {
                    return this.defaultLinkDistance;
                }
                return (self.behaviors?.types ?? {})[target.type]?.linkDistance || 100;
            })
            .iterations(5);

        this.state.forceSimulation.force('links', linkForce);
        this.internal.graph.selectAll('line.link').remove();
        const linkGroup = this.internal.graph.selectAll('line.link').data(links);

        linkGroup.enter()
            .append('line')
            .attr('class', (link: any) => {
                return this.applyLinkClasses(link);
            });
        linkGroup.exit().remove();
    }

    /**
     *  Used in animation ticks for moving the nodes up to previously calculated positions
     */
    private updateNodesPosition(): void {
        if (!this.internal.graph) {
            console.error("Cannot update nodes positions. internal.graph is null");
            return;
        }
        const translate = (d: any) => {
            if (isNaN(d.x) || isNaN(d.y)) {
                d.x = d.px = this.state.width / 2;
                d.y = d.py = this.state.height / 2;
            }
            if (d.selected) {
                return `translate(${d.x}, ${d.y})scale(${this.state.view.scale})`;
            }
            return `translate(${d.x}, ${d.y})`;
        };
        this.internal.graph.selectAll('g.node').attr('transform', translate)
            .style('opacity', (d: any) => {
                return d.blurred ? 0.15 : d.opacity;
            });
    }

    /**
     *  Used in animation ticks for moving the links up to previously calculated positions
     */
    private updateLinksPosition(): void {
        if (!this.internal.graph) {
            console.error("Cannot update links positions. internal.graph is null");
            return;
        }
        this.internal.graph.selectAll('line.link')
            .attr('x1', function (d: any) { return d.source.x; })
            .attr('y1', function (d: any) { return d.source.y; })
            .attr('x2', function (d: any) { return d.target.x; })
            .attr('y2', function (d: any) { return d.target.y; })
            .style('opacity', function (d: any, _: any) {
                return d.target.blurred ? 0.15 : d.target.opacity;
            });
    }

    private paintNodes(): void {
        if (!this.internal.graph) {
            console.error("Cannot paint nodes. internal.graph is null");
            return;
        }
        const nodeTypes: { [i: string]: ITopologyTypeBehaviors } = cloneDeep(this.behaviors?.types ?? {});
        this.internal.nodes.forEach((node: any) => {
            node.nodeId = node.type;
            if (node.type === 'host') {
                if (this.state.showStoppedInstances || this.state.viewMode === ViewMode.Lastscan) {
                    let hostState = '';
                    if (typeof (nodeTypes?.host?.state) === 'function') {
                        hostState = nodeTypes?.host?.state(node);
                    }
                    if (nodeTypes[hostState]) {
                        return;
                    }
                    nodeTypes[hostState] = cloneDeep(nodeTypes['host']);
                    nodeTypes[hostState]['type'] = hostState;
                }
                if(this.topology && this.topology?.extras.agent && node.properties.host_uuid){
                    const host_agents = this.topology?.extras.agent.find( asset => asset.properties.host_uuid === node.properties.host_uuid)
                    if(host_agents){
                        node.properties['agent_name'] = host_agents.properties['agent_name'];
                        node.properties['status'] = host_agents.properties['status'];
                        node.properties['status_updated'] = host_agents.properties['status_updated'];
                    }
                }
            }
        });
        const assetTypes = Object.keys(nodeTypes).sort(function (a, b) {
            return (nodeTypes[a].renderOrder || 0) - (nodeTypes[b].renderOrder || 0);
        });

        for (let i = 0; i < assetTypes.length; i++) {
            const nodeTypeId = assetTypes[i];
            const typeInfo = nodeTypes[nodeTypeId];

            //  Get a list of distinct flavors of the given node type that appear in the graph
            const flavors: { [i: string]: boolean } = {};
            this.internal.nodes.filter((node: any) => node.nodeId === nodeTypeId)
                .forEach((node: any) => {
                    flavors[node.flavor || 'default'] = true;
                });

            const defaultElement = this.visualizationElements.get(typeInfo.type);

            for (const flavorId in flavors) {
                if (flavors.hasOwnProperty(flavorId)) {
                    const flavorElement = this.visualizationElements.get(`${typeInfo.type}/${flavorId}`, null);
                    const group = this.internal.graph.selectAll('g.' + nodeTypeId + '.' + flavorId);
                    group.selectAll('*').remove();
                    this.paintNodeGroup(nodeTypeId, flavorId, typeInfo, group, flavorElement || defaultElement);
                }
            }
        }
    }

    /**
     *  Draws the circled node with icon inside
     */
    private paintNodeGroup(nodeTypeId: string,
                           flavorId: string,
                           nodeTypeInfo: ITopologyTypeBehaviors,
                           nodeGroup: d3.Selection<any, any, any, any>,
                           element: IVisualizationElement | null) {
        if (!this.behaviors || !this.internal.graph || !element) {
            console.error("Cannot paint node group. Either behaviours, element or internal.graph are null");
            return;
        }
        // Filter the current selected node and paint the flavor selector
        if (this.behaviors.activateSelector && this.state?.selectedNode?.key) {
            const filteredNodeGrps = nodeGroup.filter(
                node => {
                    return node.key === this.state?.selectedNode?.key;
                }
            );
            filteredNodeGrps.each(
                selected => this.paintSelector(nodeTypeInfo, selected)
            );
        } else {
            // Remove any selector
            this.internal.graph.selectAll('g.selector').remove();
        }

        // Shadow for selection
        nodeGroup.append('circle')
            .attr('class', 'shadow')
            .attr('r', node => (node.radius || nodeTypeInfo.radius || 10) + 3);

        // Halo for selection
        nodeGroup.append('circle')
            .attr('class', 'halo')
            .attr('r', node => (node.radius || nodeTypeInfo.radius || 10) + 5);

        // Main circle
        nodeGroup.append('circle')
            .attr('r', node => (node.radius || nodeTypeInfo.radius || 10) + 3)
            .attr('class', 'container');

        if (element.paths) {
            element.paths.forEach(pathDescriptor => {
                let pathDef: string = '';
                let pathClass: string = '';
                if (typeof (pathDescriptor) === 'object') {
                    pathDef = pathDescriptor.definition ?? '';
                    pathClass = pathDescriptor.class ?? '';
                } else if (typeof (pathDescriptor) === 'string') {
                    pathDef = pathDescriptor;
                }
                const path = nodeGroup.append('path')
                    .attr('d', pathDef)
                    .attr('class', pathClass)
                    .attr('transform', function (d) {
                        let scale = (nodeTypeInfo.radius || 10) / 75.0;
                        if (element.scale) {
                            scale *= element.scale;
                        }
                        const shiftX = element.shiftX || 0;
                        const shiftY = element.shiftY || 0;
                        return 'scale(' + scale + '),translate(' + shiftX + ',' + shiftY + ')';
                    });
                if (element.class) {
                    path.attr('class', element.class);
                }
            });
        }
    }

    private emitMouseEvent = (event: EventEmitter<ITopologyMouseEvent>, data: any): void => {
        if(data) {
            let eventData: ITopologyMouseEvent = {
                node: data,
                x: data['x'],
                y: data['y'],
                clientX: data['x'] * this.state.view.scale + this.state.view.translateX,
                clientY: data['y'] * this.state.view.scale + this.state.view.translateY,
                pageX: d3.event.pageX,
                pageY: d3.event.pageY
            };
            event.emit(eventData);
        }
    }
    /**
     *  Registers listeners of the nodes in SVG canvas
     */
    private registerNodeEventListeners(): void {
        const self = this;
        if (!this.internal.graph) {
            console.error("Cannot register node event listener. internal.graph is null");
            return;
        }
        this.internal.graph.selectAll('g.node')
            .on('mouseover', function (d, i) {
                self.emitMouseEvent(self.onHoverStart, d);
            })
            .on('mouseout', function (d, i) {
                self.emitMouseEvent(self.onHoverEnd, d);
            })
            .on('dblclick.zoom', function (d, i) {
                d3.event.stopPropagation();
                self.state.view.autoZoom = false;
                // TODO: emit double click event!
                self.emitMouseEvent(self.onClickedNode, d);
            })
            .on('click', function (d, i) {
                if (d3.event.defaultPrevented) {
                    return;
                }
                d3.event.preventDefault();
                self.state.view.autoZoom = false;

                // bring the node to front
                d3.select(this).each(function () {
                    if (this) {
                        (this as any).parentNode.appendChild(this);
                    }
                });

                self.emitMouseEvent(self.onClickedNode, d);
            });
    }

    private registerSelectorEventListeners(): void {
        const self = this;
        if (!this.internal.graph) {
            console.error("Cannot register selector event listener. internal.graph is nulll");
            return;
        }

        this.internal.graph.selectAll('g.selector')
            .on('click', function (d, i) {
                if (d3.event.defaultPrevented) {
                    return;
                }
                d3.event.stopPropagation();
            });

        this.internal.graph.selectAll('g.selector > .toggle.sub:not(.inactive)')
            .on('click', function (d, i) {
                if (d3.event.defaultPrevented) {
                    return;
                }
                d3.event.preventDefault();
                d3.event.stopPropagation();
                self.emitMouseEvent(self.onClickedSelectorSub, self.state.selectedNode);
            });
        this.internal.graph.selectAll('g.selector > .toggle.add:not(.inactive)')
            .on('click', function (d, i) {
                if (d3.event.defaultPrevented) {
                    return;
                }
                d3.event.preventDefault();
                d3.event.stopPropagation();
                self.emitMouseEvent(self.onClickedSelectorAdd, self.state.selectedNode);
            });
        this.internal.graph.selectAll('g.selector > .compare-arrows-1')
            .on('click', function (d, i) {
                if (d3.event.defaultPrevented) {
                    return;
                }
                d3.event.preventDefault();
                d3.event.stopPropagation();
                self.emitMouseEvent(self.onClickedSelectorUnlink, self.state.selectedNode);
            })
            .on('mouseover', function (d, i) {
                if (d3.event.defaultPrevented) {
                    return;
                }
                d3.event.preventDefault();
                d3.event.stopPropagation();
                const coor: ITopologyMouseEvent = {
                    node: null,
                    x: 0,
                    y: 0,
                    clientX: d3.event.clientX,
                    clientY: d3.event.clientY,
                    pageX: d3.event.pageX,
                    pageY: d3.event.pageY,
                    extras: { selector: 'unlink' }
                };
                self.emitMouseEvent(self.onHoverStart, coor);
            })
            .on('mouseout', function (d, i) {
                self.emitMouseEvent(self.onHoverEnd, d);
            });
        this.internal.graph.selectAll('g.selector > .compare-arrows-2')
            .on('click', function (d, i) {
                if (d3.event.defaultPrevented) {
                    return;
                }
                d3.event.preventDefault();
                d3.event.stopPropagation();
                self.emitMouseEvent(self.onClickedSelectorUnlink, self.state.selectedNode);
            })
            .on('mouseover', function (d, i) {
                if (d3.event.defaultPrevented) {
                    return;
                }
                d3.event.preventDefault();
                d3.event.stopPropagation();
                const coor: ITopologyMouseEvent = {
                    node: null,
                    x: 0,
                    y: 0,
                    clientX: d3.event.clientX,
                    clientY: d3.event.clientY,
                    pageX: d3.event.pageX,
                    pageY: d3.event.pageY,
                    extras: { selector: 'unlink' }
                };
                self.emitMouseEvent(self.onHoverStart, coor);
            })
            .on('mouseout', function (d, i) {
                self.emitMouseEvent(self.onHoverEnd, d);
            });

        this.internal.graph.selectAll('g.selector > .list')
            .on('click', function (d, i) {
                if (d3.event.defaultPrevented) {
                    return;
                }
                d3.event.preventDefault();
                d3.event.stopPropagation();
                self.emitMouseEvent(self.onClickedSelectorList, self.state.selectedNode);
            })
            .on('mouseover', function (d, i) {
                if (d3.event.defaultPrevented) {
                    return;
                }
                d3.event.preventDefault();
                d3.event.stopPropagation();
                const coor: ITopologyMouseEvent = {
                    node: null,
                    x: 0,
                    y: 0,
                    clientX: d3.event.clientX,
                    clientY: d3.event.clientY,
                    pageX: d3.event.pageX,
                    pageY: d3.event.pageY,
                    extras: { selector: 'list' }
                };
                self.emitMouseEvent(self.onHoverStart, coor);
            })
            .on('mouseout', function (d, i) {
                self.emitMouseEvent(self.onHoverEnd, d);
            });
    }

    /**
     * Determines the proper scale for the current view based on the real size of canvas
     * This function zooms the canvas automatically using calculated scale
     */
    private automaticZoom(): void {

        if (!this.svg){
            console.error("Cannot use autoamtic. svg property is null");
            return;
        }

        const canvas = { x0: 10000000, y0: 100000000, x1: 0, y1: 0, width: 0, height: 0, scaleX: 0, scaleY: 0 };

        this.state.forceSimulation.nodes().forEach(function (d: any) {
            canvas.x0 = Math.min(canvas.x0, d.x - 100);
            canvas.y0 = Math.min(canvas.y0, d.y - 100);
            canvas.x1 = Math.max(canvas.x1, d.x + 100);
            canvas.y1 = Math.max(canvas.y1, d.y + 100);
        });

        canvas.width = canvas.x1 - canvas.x0;
        canvas.height = canvas.y1 - canvas.y0;
        canvas.scaleX = this.state.width / canvas.width;
        canvas.scaleY = this.state.height / canvas.height;

        const cx = canvas.x0 + canvas.width / 2;
        const cy = canvas.y0 + canvas.height / 2;

        let scale = Math.min(canvas.scaleX, canvas.scaleY);
        let y = (this.state.height / 2) - (cy * scale);

       // Find out if the current height is greater than the max canvas height that zoomed out is still useful for the user
        if (this.behaviors?.enhanceAutoZoom && canvas.height > this.maxCanvasHeight) {
            // Enhance AutoZoom by aiming to the top of the graph
            scale = canvas.scaleX * 1.5; // Zoom-in more to let the user know there is more to explore
            y = (canvas.y1 - (canvas.height / 10)) * scale; // "y" calculated from the upper node, minus a portion of the canvas height
        }

        const x = (this.state.width / 2) - (cx * scale);

        const duration = this.behaviors?.transitionDuration ?? this.defaultTransitionDuration;
        const targetTransform = d3.zoomIdentity.translate(x, y).scale(scale);
        this.svg.transition()
            .duration(duration)
            .call(this.state.view.zoomListener.transform, targetTransform);
    }

    /**
     *  Initialize force-directed layout
     *  This draws the canvas and set the settings for the force-directed graph
     */
    private initializeSVG(): boolean {

        this.state.width = this.elementRef.nativeElement.clientWidth || this.defaultWidth;
        this.state.height = this.elementRef.nativeElement.clientHeight || this.defaultHeight;

        if (this.state.width === 0 || this.state.height === 0) {
            console.error("Warning: graph container has zero dimensions.  Cannot instantiate graph without dimension information.");
            return false;
        }

        this.svg = d3.select('.environment-graph')
            .append('svg')
            .attr('class', 'container');

        this.svg.on('click', () => {
            if (d3.event.defaultPrevented) {
                return;
            }
            const eventData: ITopologyMouseEvent = {
                node: null,
                x: 0,
                y: 0,
                clientX: d3.event.clientX,
                clientY: d3.event.clientY,
                pageX: d3.event.pageX,
                pageY: d3.event.pageY
            };

            this.onClickedNode.emit(eventData);
        });

        // This section add drop shadow effect to be applied to nodes
        // create filter with id #drop-shadow
        // size at 130% so that the shadow is not clipped
        const filter = this.svg.append('defs')
            .append('filter')
            .attr('id', 'blur-filter')
            .attr('height', '130%')
            .attr('width', '130%');

        // SourceAlpha refers to opacity of graphic that this filter will be applied to
        // convolve that with a Gaussian with standard deviation 1.2 and store result
        // in blur
        filter.append('feGaussianBlur')
            .attr('in', 'SourceAlpha')
            .attr('stdDeviation', 1.2)
            .attr('result', 'blur');

        // translate output of Gaussian blur to the right and downwards with 1px
        // store result in offsetBlur
        filter.append('feOffset')
            .attr('in', 'blur')
            .attr('dx', 1)
            .attr('dy', 1)
            .attr('result', 'offsetBlur');

        // overlay original SourceGraphic over translated blurred opacity by using
        // feMerge filter. Order of specifying inputs is important!
        const feMerge = filter.append('feMerge');

        feMerge.append('feMergeNode')
            .attr('in', 'offsetBlur');
        feMerge.append('feMergeNode')
            .attr('in', 'SourceGraphic');


        // The visualization will occupy this layer (g) with class 'topology'.
        this.internal.graph = this.svg.append('g').attr('class', 'topology ' + this.behaviors?.visualizationClass ?? '');
        this.state.forceSimulation = d3.forceSimulation()
            .alpha(0.2)
            .alphaDecay(0.05)
            .velocityDecay(0.9);

        this.state.iteration = 0;

        this.state.view.zoomListener = d3.zoom();

        this.state.view.zoomListener.scaleExtent([0.05, 2.5]);

        const state = this.state, internal = this.internal;

        this.state.view.zoomListener.on('zoom', (_: any) => {
            const transform = d3.event.transform;
            state.view.scale = transform.k;
            state.view.translateX = transform.x;
            state.view.translateY = transform.y;
            // console.log("Zoom fired with (%s,%s) @ %s!", transform.x, transform.y, transform.k );
            if (internal.graph) {
                internal.graph.attr('transform', `translate(${transform.x},${transform.y})scale(${transform.k})`);
            }
        });
        this.state.view.zoomListener.on('end', () => {

            // console.log("Zoom ended with (%s,%s) @ %s!", this.state.view.translateX, this.state.view.translateY, this.state.view.scale );
            this.viewChanged.emit(this.state);
        });
        this.state.view.zoomListener(this.svg);
        return true;
    }

    private paintProtectionLevelSelector(_: ITopologyTypeBehaviors,
                                        node: any,
                                        selector: d3.Selection<any, any, any, any>): void {
        const getFlavor = (idx: number = 0): string => {
            if (this.behaviors?.availableFlavors &&
                this.behaviors.availableFlavors.length > 0) {
                return this.behaviors.availableFlavors[idx] ?? '';
            }
            return '';
        };
        const len: number = this.behaviors?.availableFlavors?.length || -1;
        // Left clickable
        selector.append('rect')
            .attr('class', 'selector toggle sub')
            .classed('inactive', d => getFlavor() === node.flavor)
            .attr('width', 23)
            .attr('height', 20)
            .attr('x', 1)
            .attr('y', -10);
        selector.append('text')
            .attr('class', 'selector toggle arrow sub')
            .classed('inactive', d => getFlavor() === node.flavor)
            .attr('x', 11)
            .attr('y', 5)
            .text('\uf0d9');
        // Center body
        selector.append('rect')
            .attr('class', 'selector')
            .attr('width', 70)
            .attr('height', 20)
            .attr('x', 1 + 23 + 1)
            .attr('y', -10);
        // Righ clickable
        selector.append('rect')
            .attr('class', 'selector toggle add')
            .classed('inactive', d =>
                getFlavor(len - 1) === node.flavor)
            .attr('width', 20)
            .attr('height', 20)
            .attr('x', 1 + 23 + 1 + 70 + 1)
            .attr('y', -10);
        selector.append('text')
            .attr('class', 'selector toggle arrow add')
            .classed('inactive', d =>
                getFlavor(len - 1) === node.flavor)
            .attr('x', 1 + 23 + 1 + 70 + 1 + 8)
            .attr('y', 5)
            .text('\uf0da');
        // Flavor name
        selector.append('text')
            .text(this.getProtectionLevelSelectorLabelText(node.flavor))
            .attr('class', 'selector label')
            .attr('x', 2 + ((1 + 23 + 1 + 70 + 1 + 20) / 2))
            .attr('y', 3);
        // Title name
        const nodeName = this.getRenderNameFun(node)(node);
        selector.append('text')
            .text(nodeName)
            .attr('class', 'selector name')
            .attr('x', 2 + ((1 + 23 + 1 + 70 + 1 + 20) / 2))
            .attr('y', -15);
    }

    private paintPeerSelector(nodeTypeInfo: ITopologyTypeBehaviors,
        node: any,
        selector: d3.Selection<any, any, any, any>): void {
        const dx = node.radius || nodeTypeInfo.radius || 10;
        this.selectorConfig['x'] = node.x + dx + 7.5;
        this.selectorConfig['y'] = node.y;
        const nodeName = this.getRenderNameFun(node)(node);
        const text1 = node.type === 'region' ? `All Networks in ${nodeName}` : nodeName;
        const text2 = 'protected by';
        // Title name
        selector.append('text')
            .text(text1)
            .attr('class', 'selector name-bold-small')
            .attr('x', 30 + ((1 + 23 + 1 + 70 + 1 + 20 - 1) / 2))
            .attr('y', -30);


        selector.append('text')
            .text(text2)
            .attr('class', 'selector name')
            .attr('x', 30 + ((1 + 23 + 1 + 70 + 1 + 20 - 1) / 2))
            .attr('y', -20);
    }

    private paintUnlinkSelector(_: ITopologyTypeBehaviors,
                                node: any,
                                selector: d3.Selection<any, any, any, any>): void {
        if (!this.topology) {
            console.error("Cannot paint unlink selector. topology property is null");
            return;
        }
        const nodeName = this.getRenderNameFun(node)(node);
        const text1 = node.type === 'region' ? `All Networks in ${nodeName}` : nodeName;
        const text2 = 'protected by';
        // Title name
        selector.append('text')
            .text(text1)
            .attr('class', 'selector name-bold-small')
            .attr('x', 10 + ((1 + 23 + 1 + 70 + 1 + 20 - 1) / 2))
            .attr('y', -30);

        selector.append('text')
            .text(text2)
            .attr('class', 'selector name')
            .attr('x', 10 + ((1 + 23 + 1 + 70 + 1 + 20 - 1) / 2))
            .attr('y', -20);
        // Center body
        selector.append('rect')
            .attr('class', 'selector')
            .attr('width', 70 + 70)
            .attr('height', 20)
            .attr('x', 1)
            .attr('y', -10);
        // Rigth clickable
        const compareArrowsElement = this.visualizationElements.get(`compare-arrows`, null);
        (compareArrowsElement?.paths ?? []).forEach((pathDescriptor, i: number) => {
            if (typeof (pathDescriptor) === 'string') {
                const pathDef = pathDescriptor;
                const path = selector.append('path')
                    .attr('d', pathDef)
                    .attr('transform', function (d) {
                        const scale = compareArrowsElement?.scale ?? 0;
                        const x = compareArrowsElement?.shiftX ?? 0;
                        const y = compareArrowsElement?.shiftY ?? 0;
                        return `scale(${scale}),translate(${x},${y})`;
                    });
                if (i === 0) {
                    path.attr('class', 'compare-arrows-1');
                } else {
                    path.attr('class', 'compare-arrows-2');
                }
            }

        });

        // selected vpc name
        let vpcName = '(Unknown)';
        let vpc: TopologyNode | null = null;
        if (this.state.selectedVpc) {
            if (this.state.selectedVpc.properties['name']?.length > 20) {
                vpcName = this.state.selectedVpc.properties.name.substring(0, 25) + '...';
            } else {
                vpcName = this.state.selectedVpc.properties.name;
            }
            vpc = this.state.selectedVpc;
        } else if (node.flavor === 'peering') {
            const peeredTo = node.type === 'region' && !node.peeredTo ? node.children[0].peeredTo : node.peeredTo;
            if (peeredTo.name.length > 20) {
                vpcName = peeredTo.name.substring(0, 25) + '...';
            } else {
                vpcName = peeredTo.name;
            }
            vpc = peeredTo;
        }

        if (!vpc) {
            console.error("Cannot paint unlink selector. selected vpc is null");
            return;
        }

        selector.append('text')
            .text(vpcName)
            .attr('class', 'selector label')
            .attr('x', 10 + ((1 + 23 + 1 + 70 + 1 + 20) / 2))
            .attr('y', 3);
        if (!this.topology.getByKey(vpc.key)) {
            let deploymentName: string = vpc.deploymentName ?? 'Unknown';
            if (deploymentName.length > 20) {
                deploymentName = deploymentName.substring(0, 25) + '...';
            }
            const textA = 'in deployment';
            const textB = deploymentName;
            selector.append('text')
                .text(textA)
                .attr('class', 'selector name')
                .attr('x', 10 + ((1 + 23 + 1 + 70 + 1 + 20 - 1) / 2))
                .attr('y', 23);

            selector.append('text')
                .text(textB)
                .attr('class', 'selector name-bold-small')
                .attr('x', 10 + ((1 + 23 + 1 + 70 + 1 + 20 - 1) / 2))
                .attr('y', 33);
        }
    }

    private paintListSelector(_: ITopologyTypeBehaviors,
                              node: any,
                              selector: d3.Selection<any, any, any, any>): void {

        let text: string = this.getRenderNameFun(node)(node);
        text = text.length > 20 ? text.substring(0, 25) + '...' : text;
        // Title name
        selector.append('text')
            .text(text)
            .attr('class', 'selector name-bold-big')
            .attr('x', 10 + ((1 + 23 + 1 + 70 + 1 + 20 - 1) / 2))
            .attr('y', -20);
        // Center body
        selector.append('rect')
            .attr('class', 'selector')
            .attr('width', 70 + 70)
            .attr('height', 20)
            .attr('x', 1)
            .attr('y', -10);
        // Rigth clickable
        const listElement = this.visualizationElements.get(`list`, null);
        (listElement?.paths ?? []).forEach((pathDescriptor, i: number) => {
            if (typeof(pathDescriptor) === 'string') {
                const pathDef = pathDescriptor;
                const path = selector.append('path')
                    .attr('d', pathDef)
                    .attr('transform', function (d) {
                        const scale = listElement?.scale ?? 0;
                        const x = listElement?.shiftX ?? 0;
                        const y = listElement?.shiftY ?? 0;
                        return `scale(${scale}),translate(${x},${y})`;
                    });
                path.attr('class', 'list');
            }
        });

        let numberOfNetworks: number | string = node.peeredFrom.length;
        if (node.peeredFrom.find((n: any) => n.type === 'region')) {
            numberOfNetworks = 'many';
        }
        text = `Protecting ${numberOfNetworks} Networks`;
        selector.append('text')
            .text(text)
            .attr('class', 'selector label')
            .attr('x', 2 + ((1 + 23 + 1 + 70 + 1 + 20) / 2) + 7)
            .attr('y', 3);
    }

    /**
     *  Draws the selector for a node
     */
    private paintSelector(nodeTypeInfo: ITopologyTypeBehaviors, node: any) {
        if (!this.internal.graph) {
            console.error("Cannot paint selector. internal.graph is null");
            return;
        }
        // Remove previous selector
        this.internal.graph.selectAll('g.selector').remove();

        // Add the 'g' to contain the selector
        this.internal.graph.insert('g', `g.node#node-${node.index}`)
            .attr('class', 'selector')
            .attr('id', 'selector')
            .attr('transform', `translate( ${(node.radius || nodeTypeInfo.radius || 10) + node.x} , ${node.y} )`);
        const selectorElement = this.internal.graph.selectAll('g.selector');
        // Reset the selector when necessary
        if (node.flavor === 'peered') {
            this.selector = 'list';
        } else if (node.flavor === 'peering') {
            if (node.parent
                && node.parent.flavor === 'peering') {
                this.selector = '';
            } else {
                this.selector = 'unlink';
            }

        } else if (node.flavor === 'peering') {
            this.selector = '';
        } else if (this.selector !== 'flavor') {
            this.selector = 'peer';
        }
        // Painting the selector
        if (this.selector === 'flavor') {
            this.paintProtectionLevelSelector(nodeTypeInfo, node, selectorElement);
        } else if (this.selector === 'peer') {
            this.paintPeerSelector(nodeTypeInfo, node, selectorElement);
        } else if (this.selector === 'unlink') {
            this.paintUnlinkSelector(nodeTypeInfo, node, selectorElement);
        } else if (this.selector === 'list') {
            this.paintListSelector(nodeTypeInfo, node, selectorElement);
        }

        this.registerSelectorEventListeners();
    }

    private getTopLevelNodesFromTopology(): TopologyNode[] {
        switch (this.behaviors?.topLevelNodes) {
            case 'regions':
                return this.topology?.regions ?? [];
            case 'vpcs':
                return this.topology?.vpcs ?? [];
            default:
                console.error(`${this.behaviors?.topLevelNodes}s cannot be top level nodes`);
                return [];
        }
    }

    private getRenderNameFun(node: any): (a: any) => string {
        return AssetTypeDictionary.getType(node.type)?.renderName ?? ((_) => 'Unknown');
    }

}
