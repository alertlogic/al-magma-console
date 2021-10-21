import { TopologyNode } from "@al/assets-query";
import { ITopologyBehaviors, ViewMode, AlEnvironmentTopologyState } from "../../types/environment-topology.types";

export class OverviewAwsAndAzureTopologyBehaviors implements ITopologyBehaviors {
    public types = {
        'region': {
            type: 'region',
            visible: true,
            radius: 15
        },
        'vpc': {
            type: 'vpc',
            visible: true,
            radius: 10,
            linkDistance: 100
        },
        'subnet': {
            type: 'subnet',
            visible: true,
            radius: 10,
            linkDistance: 30
        },
        'host': {
            type: 'host',
            visible: true,
            radius: 10,
            linkDistance: 10,
            state: (node: TopologyNode) => {
                    if (node.type === 'host') {
                        if (node.stoppedInstance) {
                            node.nodeId =  `host-stopped`;
                        } else if (node.hasOwnProperty('lastScan')) {
                            if (node.scanInProgress) {
                                node.nodeId = `host-scan-in-progress`;
                            } else if (node.lastScan.code === 'not-scanned') {
                                 node.nodeId = `host-not-scanned`;
                            }
                        }
                    }
                    return node.nodeId;
                }
        },
        'load-balancer': {
            type: 'load-balancer',
            visible: true,
            radius: 8,
            linkDistance: 10
        },
        'container': {
            type: 'container',
            visible: true,
            radius: 8,
            linkDistance: 10
        },
        'sg': {
            type: 'sg',
            visible: true,
            radius: 8,
            linkDistance: 50
        },
        'db-instance': {
            type: 'db-instance',
            visible: true,
            radius: 10,
            linkDistance: 30
        },
        'image': {
            type: 'image',
            visible: true,
            radius: 8,
            linkDistance: 20
        }
    };
    // image, sg, load-balancer, tag, db-instance, container, db-instance
    visualizationClass = 'default';
    transitionDuration = 500;
    organizeByType = 'region';
    enhanceAutoZoom = true;

    /**
     *  Determine initial positioning of the nodes
     */
    initialize(viewState: AlEnvironmentTopologyState,
        topLevelNodes: any[]) {
    }

    classify(node: TopologyNode, extras?: {[i: string] : any}): string[] {

        let viewMode = ViewMode.None;
        if (extras && extras['viewMode']) {
            viewMode = extras['viewMode'];
        }
        let hostExtraInfo: {[i: string]: any} = {};
        if (extras && extras['hostExtraInfo']) {
            hostExtraInfo = extras['hostExtraInfo'];
        }
        let showStoppedInstances = false;
        if (extras && extras['showStoppedInstances']) {
            showStoppedInstances = extras['showStoppedInstances'];
        }
        const result = [];
        if (viewMode !== ViewMode.None) {
            switch (viewMode ) {
                case ViewMode.Lastscan:
                    if (node.type === 'host') {
                        if (!node.scanInProgress) {
                            if (node.lastScan.code === 'not-scanned'){
                                result.push('host-not-scanned');
                            } else {
                                result.push( 'lastscan-' + node.lastScan.code );
                            }
                        } else {
                            result.push( 'lastscan-scan-in-progress' );
                        }
                    }
                    break;
                case ViewMode.RemediationsThreat:
                    result.push( 'risk-' + node.remediationsThreatLevel.code );
                    break;
                case ViewMode.Credentials:
                    if (node.hasCredentials) {
                        result.push( 'with-credentials' );
                    }
                    break;
                       case ViewMode.RemediationsConfigThreat:
                    if (node.configurationRemediations) {
                        result.push( 'risk-' + node.remediationsThreatLevel.code );
                    } else {
                        result.push( 'risk-none');
                    }
                    break;
                case ViewMode.RemediationsSecThreat:
                    if (node.securityRemediations) {
                        result.push( 'risk-' + node.remediationsThreatLevel.code );
                    } else {
                        result.push( 'risk-none');
                    }
                    break;
                case ViewMode.IncidentsThreat:
                    break;
                case ViewMode.AgentsMap:
                    const agentStatus = node.properties['agent_status'];
                    if(agentStatus) {
                        result.push('agent-map');
                        result.push('agent-map-' + agentStatus);
                    }
                    break;
            }
        }
        if (node.focused) {
            result.push('focused');
        }
        if (node.selected) {
            result.push('selected');
        }
        if (node.matched) {
            result.push('matched');
        }
        if ( showStoppedInstances
            && node.type === 'host'
            && hostExtraInfo
            && hostExtraInfo[node.key]
            && hostExtraInfo[node.key]?.properties?.state === 'stopped') {
            node.stoppedInstance = true;
            result.push('host-stopped');
        } else {
            node.stoppedInstance = false;
        }
        return result;
    }
    classifyLink(_: any, linkTarget: TopologyNode, extras?: {[i: string]: any}): string[] {
        const result = [];
        let viewMode = ViewMode.None;
        if (extras && extras['viewMode']) {
            viewMode = extras['viewMode'];
        }
        if (viewMode === ViewMode.None) {
            if (linkTarget.matched) {
                result.push('matched');
            }

        }
        return result;
    }
}


export class OverviewDatacenterTopologyBehaviors implements ITopologyBehaviors {
    public types = {
        'vpc': {
            type: 'network',
            visible: true,
            radius: 10,
            linkDistance: 100
        },
        'subnet': {
            type: 'subnet',
            visible: true,
            radius: 10,
            linkDistance: 30
        },
        'host': {
            type: 'host',
            visible: true,
            radius: 10,
            linkDistance: 10,
            state: (node: TopologyNode) => {
                if (node.type === 'host') {
                    if (node.stoppedInstance) {
                        node.nodeId =  `host-stopped`;
                    } else if (node.hasOwnProperty('lastScan')) {
                        if (node.scanInProgress) {
                            node.nodeId = `host-scan-in-progress`;
                        } else if (node.lastScan.code === 'not-scanned') {
                             node.nodeId = `host-not-scanned`;
                        }
                    }
                }
                return node.nodeId;
            }
        }
    };
    visualizationClass = 'default';
    transitionDuration = 500;
    organizeByType = 'vpc';
    topLevelNodes = 'vpcs' as 'vpcs' | 'regions';
    enhanceAutoZoom = true;

    /**
     *  Determine initial positioning of the nodes
     */
    initialize(viewState: AlEnvironmentTopologyState,
        topLevelNodes: any[]) {
    }

    classify(node: any, extras?: any): string[] {
        let viewMode = ViewMode.None;
        if (extras && extras['viewMode']) {
            viewMode = extras['viewMode'];
        }
        let hostExtraInfo: {[i: string]: any} = {};
        if (extras && extras['hostExtraInfo']) {
            hostExtraInfo = extras['hostExtraInfo'];
        }
        let showStoppedInstances = false;
        if (extras && extras['showStoppedInstances']) {
            showStoppedInstances = true;
        }
        const result = [];
        if (viewMode !== ViewMode.None) {
            switch (viewMode ) {
                case ViewMode.Lastscan:
                    if (node.type === 'host') {
                        if (!node.scanInProgress) {
                            if (node.lastScan.code === 'not-scanned'){
                                result.push('host-not-scanned');
                            } else {
                                result.push( 'lastscan-' + node.lastScan.code );
                            }
                        } else {
                            result.push( 'lastscan-scan-in-progress' );
                        }
                    }
                    break;
                case ViewMode.RemediationsThreat:
                    result.push( 'risk-' +  node.remediationsThreatLevel.code );
                    break;
                case ViewMode.Credentials:
                    if (node.hasCredentials) {
                        result.push( 'with-credentials' );
                    }
                    break;
                       case ViewMode.RemediationsConfigThreat:
                    if (node.configurationRemediations) {
                        result.push( 'risk-' + node.remediationsThreatLevel.code );
                    } else {
                        result.push( 'risk-none');
                    }
                    break;
                case ViewMode.RemediationsSecThreat:
                    if (node.securityRemediations) {
                        result.push( 'risk-' + node.remediationsThreatLevel.code );
                    } else {
                        result.push( 'risk-none');
                    }
                    break;
                case ViewMode.AgentsMap:
                    const agentStatus = node.properties['agent_status'];
                    if(agentStatus) {
                        result.push('agent-map');
                        result.push('agent-map-' + agentStatus);
                    }
                    break;
                case ViewMode.IncidentsThreat:
                    break;
            }
        }
        if (node.focused) {
            result.push('focused');
        }
        if (node.selected) {
            result.push('selected');
        }
        if (node.matched) {
            result.push('matched');
        }
        if ( showStoppedInstances
            && node.type === 'host'
            && hostExtraInfo
            && hostExtraInfo[node.key]
            && hostExtraInfo[node.key].state
            && hostExtraInfo[node.key].state === 'stopped' ) {
            result.push('host-stopped');
        }
        return result;
    }
    classifyLink(_: TopologyNode, linkTarget: TopologyNode, extras?: {[i: string]: any}) {
        const result = [];
        let viewMode = ViewMode.None;
        if (extras && extras['viewMode']) {
            viewMode = extras['viewMode'];
        }
        if (viewMode === ViewMode.None) {
            if (linkTarget.matched) {
                result.push('matched');
            }

        }
        return result;
    }
}


export class ConfigAwsAndAzureDiscoveryAndTopologyOverviewTopologyBehaviors implements ITopologyBehaviors {
    public types = {
        'region': {
            type: 'region',
            visible: true,
            radius: 20
        },
        'vpc': {
            type: 'vpc',
            visible: true,
            radius: 15,
            linkDistance: 100
        }
    };
    visualizationClass = 'scope';
    transitionDuration = 500;
    activateSelector = false;
    organizeByType = 'vpc';
    groupByType = 'vpc';

    /**
     *  Determine initial positioning of the nodes
     */
    initialize(viewState: AlEnvironmentTopologyState,
        topLevelNodes: any[]) {
    }

    classify(node: any): string[] {
        const result = [];
        if (node.matched) {
            result.push('matched');
        }

        return result;
    }

    classifyLink(_: TopologyNode, linkTarget: TopologyNode) {
        const result = [];
        if (linkTarget.matched) {
            result.push('matched');
        }

        return result;
    }
}

export class ConfigAwsAndAzureProtectionOptionsTopologyBehaviors implements ITopologyBehaviors {

    public types = {
        'region': {
            type: 'region',
            visible: true,
            radius: 20
        },
        'vpc': {
            type: 'vpc',
            visible: true,
            radius: 15,
            linkDistance: 100
        }
    };
    visualizationClass = 'peer';
    transitionDuration = 500;
    activateSelector = true;
    availableAssets: TopologyNode[] = [];
    organizeByType = 'vpc';
    groupByType = 'vpc';


    /**
     *  Determine initial positioning of the nodes
     */
    initialize(viewState: AlEnvironmentTopologyState,
        topLevelNodes: any[]) {
    }

    classify(node: any, extras?: any): string[] {
        const result = [];
        if (node.focused) {
            result.push('focused');
        }
        if (node.exclude) {
            result.push('exclude');
        }
        if (node.matched) {
            result.push('matched');
        }

        if (extras && extras['selectedNode'] &&
            (node.type === extras['selectedNode'].type && node.key === extras['selectedNode'].key ||
            node.parent && node.parent.type === extras['selectedNode'].type && node.parent.key === extras['selectedNode'].key)
            ) {
            result.push('selected');
        }
        return result;
    }

    classifyLink(linkSource: TopologyNode, linkTarget: TopologyNode, extras?: {[i: string]: any}) {
        const result = [];
        if (linkTarget.matched) {
            result.push('matched');
        }

        if (extras && extras['selectedNode'] &&
            linkSource.type === extras['selectedNode'].type && linkSource.key === extras['selectedNode'].key) {
            result.push('selected');
        }
        return result;
    }

    selectPeer() {

    }
}

export class ConfigAwsAndAzureScopeOfProtectionTopologyBehaviors implements ITopologyBehaviors {

    public types = {
        'region': {
            type: 'region',
            visible: true,
            radius: 20
        },
        'vpc': {
            type: 'vpc',
            visible: true,
            radius: 15,
            linkDistance: 100
        }
    };
    visualizationClass = 'scope';
    transitionDuration = 500;
    activateSelector = true;
    availableFlavors: string[] = [];
    organizeByType = 'vpc';
    groupByType = 'vpc';

    /**
     *  Determine initial positioning of the nodes
     */
    initialize(viewState: AlEnvironmentTopologyState,
        topLevelNodes: any[]) {
    }

    classify(node: any, extras?: any): string[] {
        const result = [];
        if (node.focused) {
            result.push('focused');
        }
        if (node.exclude) {
            result.push('exclude');
        }
        if (node.matched) {
            result.push('matched');
        }

        if (extras && extras['selectedNode'] &&
            (node.type === extras['selectedNode'].type && node.key === extras['selectedNode'].key ||
            node.parent && node.parent.type === extras['selectedNode'].type && node.parent.key === extras['selectedNode'].key)
            ) {
            result.push('selected');
        }
        return result;
    }

    classifyLink(linkSource: TopologyNode, linkTarget: TopologyNode, extras?: {[i: string]: any}) {
        const result = [];
        if (linkTarget.matched) {
            result.push('matched');
        }

        if (extras && extras['selectedNode'] &&
            linkSource.type === extras['selectedNode'].type && linkSource.key === extras['selectedNode'].key) {
            result.push('selected');
        }
        return result;
    }

    selectFlavor(action: string, actual: string) {
        let flavor = 'default';
        if (this.availableFlavors.length > 0) {
            action = ( ['add', 'sub'].indexOf(action) >= 0 ) ? action : 'add';
            let actualIndex = (this.availableFlavors.indexOf(actual) >= 0) ? this.availableFlavors.indexOf(actual) : -1;

            switch (action) {
                case 'add':
                    actualIndex = (actualIndex >= (this.availableFlavors.length - 1)) ? 0 : actualIndex + 1;
                    flavor = this.availableFlavors[actualIndex];
                    break;
                case 'sub':
                    actualIndex = (actualIndex <= 0) ? this.availableFlavors.length - 1 : actualIndex - 1;
                    flavor = this.availableFlavors[actualIndex];
                    break;
                default:
                    break;
            }
        }
        return flavor;
    }
}

export class ConfigDatacenterAddAssetsTopologyBehaviors implements ITopologyBehaviors {
    public types = {
        'vpc': {
            type: 'network',
            visible: true,
            radius: 20
        },
        'subnet': {
            type: 'subnet',
            visible: true,
            radius: 15
        }
    };
    visualizationClass = 'scope';
    transitionDuration = 500;
    topLevelNodes = 'vpcs' as 'vpcs' | 'regions';
    organizeByType = 'subnet';
    groupByType = 'subnet';
    activateFlavorSelector = false;

    /**
     *  Determine initial positioning of the nodes
     */
    initialize(viewState: AlEnvironmentTopologyState,
        topLevelNodes: any[]) {
    }

    classify(node: any, extras?: any): string[] {
        const result = [];
        if (node.focused) {
            result.push('focused');
        }
        if (node.exclude) {
            result.push('exclude');
        }
        if (node.matched) {
            result.push('matched');
        }

        if (extras && extras['selectedNode'] &&
            (node.type === extras['selectedNode'].type &&
             node.key === extras['selectedNode'].key )
            ) {
            result.push('selected');
        }
        return result;
    }

    classifyLink(_: TopologyNode, linkTarget: TopologyNode, extras?: {[i: string]: any}) {
        const result = [];
        if (linkTarget.matched) {
            result.push('matched');
        }

        return result;
    }
}

export class ConfigDatacenterScopeOfProtectionTopologyBehaviors implements ITopologyBehaviors {

    public types = {
        'vpc': {
            type: 'network',
            visible: true,
            radius: 20
        },
        'subnet': {
            type: 'subnet',
            visible: true,
            radius: 15
        }
    };
    visualizationClass = 'scope';
    transitionDuration = 500;
    topLevelNodes = 'vpcs' as 'vpcs' | 'regions';
    organizeByType = 'subnet';
    groupByType = 'subnet';
    activateSelector = true;
    availableFlavors: string[] = [];

    /**
     *  Determine initial positioning of the nodes
     */
    initialize(viewState: AlEnvironmentTopologyState,
        topLevelNodes: any[]) {
    }

    classify(node: any, extras?: any): string[] {
        const result = [];
        if (node.focused) {
            result.push('focused');
        }
        if (node.exclude) {
            result.push('exclude');
        }
        if (node.matched) {
            result.push('matched');
        }

        if (extras && extras['selectedNode'] &&
            (node.type === extras['selectedNode'].type && node.key === extras['selectedNode'].key ||
            node.parent && node.parent.type === extras['selectedNode'].type && node.parent.key === extras['selectedNode'].key)
            ) {
            result.push('selected');
        }
        return result;
    }

    classifyLink(linkSource: TopologyNode, linkTarget: TopologyNode, extras?: {[i: string]: any}) {
        const result = [];
        if (linkTarget.matched) {
            result.push('matched');
        }

        if (extras && extras['selectedNode'] &&
            linkSource.type === extras['selectedNode'].type && linkSource.key === extras['selectedNode'].key) {
            result.push('selected');
        }
        return result;
    }

    selectFlavor(action: string, current: string) {
        let flavor = 'default';
        if (this.availableFlavors.length > 0) {
            action = ( ['add', 'sub'].indexOf(action) >= 0 ) ? action : 'add';
            let currentIndex = (this.availableFlavors.indexOf(current) >= 0) ? this.availableFlavors.indexOf(current) : -1;

            switch (action) {
                case 'add':
                    currentIndex = (currentIndex >= (this.availableFlavors.length - 1)) ? 0 : currentIndex + 1;
                    flavor = this.availableFlavors[currentIndex];
                    break;
                case 'sub':
                    currentIndex = (currentIndex <= 0) ? this.availableFlavors.length - 1 : currentIndex - 1;
                    flavor = this.availableFlavors[currentIndex];
                    break;
                default:
                    break;
            }
        }
        return flavor;
    }
}


export class ConfigDatacenterProtectionOptionsTopologyBehaviors implements ITopologyBehaviors {

    public types = {
        'vpc': {
            type: 'network',
            visible: true,
            radius: 20
        },
        'subnet': {
            type: 'subnet',
            visible: true,
            radius: 15,
            classify: (node: TopologyNode): string[] => { node.matched = false; return []; }
        }
    };
    visualizationClass = 'peer';
    transitionDuration = 500;
    topLevelNodes = 'vpcs' as 'vpcs' | 'regions';
    organizeByType = 'subnet';
    groupByType = 'subnet';
    activateSelector = true;
    availableFlavors: string[] = [];
    availableAssets: TopologyNode[] = [];

    /**
     *  Determine initial positioning of the nodes
     */
    initialize(viewState: AlEnvironmentTopologyState,
        topLevelNodes: any[]) {
    }

    classify(node: TopologyNode, extras?: any): string[] {
        const result = [];
        if (node.focused) {
            result.push('focused');
        }
        // if (node.exclude) {
        //     result.push('exclude');
        // }
        if (node.matched) {
            result.push('matched');
        }

        if (extras && extras['selectedNode'] &&
            (node.type === extras['selectedNode'].type && node.key === extras['selectedNode'].key)) {
            result.push('selected');
        }
        return result;
    }

    classifyLink(linkSource: TopologyNode, linkTarget: TopologyNode, extras?: {[i: string]: any}) {
        const result = [];
        if (linkTarget.matched) {
            result.push('matched');
        }

        if (extras && extras['selectedNode'] &&
            linkSource.type === extras['selectedNode'].type && linkSource.key === extras['selectedNode'].key) {
            result.push('selected');
        }
        return result;
    }

    selectPeer() {
    }
}

export class ConfigDatacenterTopologyOverviewTopologyBehaviors implements ITopologyBehaviors {
    public types = {
        'vpc': {
            type: 'network',
            visible: true,
            radius: 20
        },
        'subnet': {
            type: 'subnet',
            visible: true,
            radius: 15
        }
    };
    visualizationClass = 'scope';
    transitionDuration = 500;
    topLevelNodes = 'vpcs' as 'vpcs' | 'regions';
    organizeByType = 'subnet';
    groupByType = 'subnet';

    activateFlavorSelector = false;

    /**
     *  Determine initial positioning of the nodes
     */
    initialize(viewState: AlEnvironmentTopologyState,
        topLevelNodes: any[]) {
    }

    classify(node: any, extras?: any): string[] {
        const result = [];
        if (node.exclude) {
            result.push('exclude');
        }
        if (node.matched) {
            result.push('matched');
        }

        return result;
    }

    classifyLink(linkSource: TopologyNode, linkTarget: TopologyNode, extras?: any) {
        const result = [];
        if (linkTarget.matched) {
            result.push('matched');
        }

        return result;
    }

}

export class ExampleConfigBehavior implements ITopologyBehaviors {
    public types = {
        'region': {
            type: 'region',
            visible: true,
            radius: 20
        },
        'vpc': {
            type: 'vpc',
            visible: true,
            radius: 15,
            linkDistance: 100
        }
    };
    visualizationClass = 'default';
    transitionDuration = 500;
    activateSelector = false;
    organizeByType = 'vpc';
    groupByType = 'vpc';

    /**
     *  Determine initial positioning of the nodes
     */
    initialize(viewState: AlEnvironmentTopologyState,
        topLevelNodes: any[]) {
    }

    classify(node: any): string[] {
        const result = [];
        if (node.matched) {
            result.push('matched');
        }

        return result;
    }

    classifyLink(_: TopologyNode, linkTarget: TopologyNode) {
        const result = [];
        if (linkTarget.matched) {
            result.push('matched');
        }

        return result;
    }
}




