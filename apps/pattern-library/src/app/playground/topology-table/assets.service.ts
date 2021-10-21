import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { TreeNode } from 'primeng/api';

export interface AssetModel {
    topology: {
        data?: any,
        assets: [string[]]
    }
}

export interface Tag {
    key: string;
    value: any;
    groups?: string[];
}

@Injectable({
    providedIn: 'root'
})

export class AssetService {

    constructor(private http: HttpClient) {}

    getFilesystem() {
        return this.http.get<any>('assets/demo/data/filesystem.json')
                    .toPromise()
                    .then(res => res.data as any[])
                    .then(data => data);
    }

    assets: TreeNode[] = [];
    tags: Tag[] = [];

    async fetchAsync(url:string) {
        const response = await fetch(url);
        return await response.json();
    }

    getAssetsFromAssetTopology() {
        return this.http.get<TreeNode>('assets/demo/assets-topology2.json')
        .toPromise()
        .then(res => res as AssetModel)
        .then(data => {

            for (let i = 0; i < data.topology.assets.length; i++) {

                const region: string    = data.topology.assets[i][0];
                const vpc: string       = data.topology.assets[i][1];
                const subnet: string    = data.topology.assets[i][2];
                const host: string      = data.topology.assets[i][3];

                const regionNode:   TreeNode = this.addNode(this.assets, data.topology.data[region]);
                const vpcNode:      TreeNode = this.addNode((regionNode.children as TreeNode[]), data.topology.data[vpc]);
                const subnetNode:   TreeNode = this.addNode((vpcNode.children as TreeNode[]), data.topology.data[subnet]);

                // if the asset doesn't already exist, add the asset as a child
                if (region && !this.childExists((this.assets), data.topology.data[region].key)) {
                    const details = data.topology.data[region];
                    regionNode.data = {type: details.type, key: details.key, name: details.name, vpcCount: 0, subnetCount: 0, hostCount: 0, groups: [], inheritedGroups: [], tags: details.tags};
                    (regionNode.children as TreeNode[]).length = 0;
                    this.assets.push(regionNode);
                    this.addTags(details.tags);
                }

                if (vpc && !this.childExists((regionNode.children as TreeNode[]), data.topology.data[vpc].key)) {
                    const details = data.topology.data[vpc];
                    vpcNode.data = {type: details.type, key: details.key, name: details.name, subnetCount: 0, hostCount: 0, groups: [], inheritedGroups: [], tags: details.tags};
                    (vpcNode.children as TreeNode[]).length = 0;
                    (regionNode.children as TreeNode[]).push(vpcNode);
                    this.addTags(details.tags);
                }

                if (subnet &&!this.childExists((vpcNode.children as TreeNode[]), data.topology.data[subnet].key)) {
                    const details = data.topology.data[subnet];
                    subnetNode.data = {type: details.type, key: details.key, name: details.name, hostCount: 0, groups: [], inheritedGroups: [], tags: details.tags};
                    (subnetNode.children as TreeNode[]).length = 0;
                    (vpcNode.children as TreeNode[]).push(subnetNode);
                    this.addTags(details.tags);
                }

                if (host && !this.childExists((subnetNode.children as TreeNode[]), data.topology.data[host].key)) {
                    const details = data.topology.data[host];
                    (subnetNode.children as TreeNode[]).push({data:{type: details.type, key: details.key, name: details.name, groups: [], inheritedGroups: [], tags: details.tags}});

                    this.addTags(details.tags);
                }

                // add counts of things
                regionNode.data.vpcCount = (regionNode.children as TreeNode[]).length;
                regionNode.data.subnetCount = this.countNodes((regionNode.children as TreeNode[]), false);
                regionNode.data.hostCount = this.countNodes((regionNode.children as TreeNode[]), true);

                vpcNode.data.subnetCount = (vpcNode.children as TreeNode[]).length;
                vpcNode.data.hostCount = this.countNodes((vpcNode.children as TreeNode[]), false);

                subnetNode.data.hostCount = (subnetNode.children as TreeNode[]).length;

            }

            return {assets: this.assets, tags: this.tags};

        });
    }

    childExists(children: TreeNode[], key: string): boolean {
        return children.findIndex(element => element.data.key == key) != -1;
    }

    addNode(parent: TreeNode[], details: {type: string, key: string, name: string, tags: {}}): TreeNode {
        // find the current existing asset if there is one...
        const assetExists: TreeNode | undefined = parent.find(element => element.data.key == details.key);

        // if asset already exists, return it. Otherwise create a new treenode.
        if (assetExists != undefined) {
            return assetExists as TreeNode;
        } else {
            return {data: {type: details.type, key: details.key, name: details.name, groups: [], inheritedGroups: [], tags: details.tags}, children: []} as TreeNode;
        }
    }

    countNodes(nodes: TreeNode[], deep: boolean): number {
        let count = 0;
        for (let i = 0; i < (nodes).length; i++) {

            if (!deep) {
                count += (nodes[i].children as TreeNode[]).length;
            }

            if (deep) {
                for (let j = 0; j < (nodes[i].children as TreeNode[]).length; j++) {
                    count += ((nodes[i].children as TreeNode[])[j].children as TreeNode[]).length;
                }
            }
        }
        return count;
    }

    tagExists(tag: {key: string, value: string}): boolean {
        return this.tags.findIndex(element => element.key == tag.key && element.value == tag.value) != -1;
    }

    addTags(tags: {}) {

        for (const [key, value] of Object.entries(tags)) {
            const tag: Tag = {key: key, value: value, groups: []};

            if (!this.tagExists(tag)) {
                this.tags.push(tag);
            }
        }
    }
}
