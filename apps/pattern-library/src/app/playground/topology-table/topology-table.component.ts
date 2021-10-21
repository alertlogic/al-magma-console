import { AlBaseCardItem, AlBaseCardConfig, alEditDeleteFooterActions } from '@al/ng-cardstack-components';
import { Component, OnInit, ViewChild } from '@angular/core';

import { AlBottomSheetComponent, AlBottomSheetHeaderOptions } from '@al/ng-generic-components';
import { AssetService, Tag } from './assets.service';
import { TreeNode, SelectItem } from 'primeng/api';

interface Expression {
  scopes: [
    {
      include: string[],
      exclude?: string[],
      asset_types?: string[]
    }
  ];
}

@Component({
  selector: 'app-topology-table',
  templateUrl: './topology-table.component.html',
  styleUrls: ['./topology-table.component.scss']
})
export class TopologyTableComponent implements OnInit {

  @ViewChild(AlBottomSheetComponent)
  alBottomSheet!: AlBottomSheetComponent;

  assets: TreeNode[] = [];
  assetDetails: any = null;
  tags: Tag[] = [];
  assetTableCols: any[] = [];
  tagTableCols: any[] = [];
  selectedNodes: TreeNode[] = [];
  selectedNode: TreeNode = {};
  selectedTags: Tag[] = [];
  selectedGroups: any = [];
  groupName: string = '';
  criticality: number = 0;
  description: string = '';
  
  expression: Expression = {
    scopes: [
      {
        include: [],
        asset_types: []
      }
    ]
  };

  assetGroupSummary = {
    includes: {
      regions: 0,
      vpcs: 0,
      subnets: 0,
      hosts: 0
    },
    excludes: {
      regions: 0,
      vpcs: 0,
      subnets: 0,
      hosts: 0
    }
  };

  /**
   * Monaco Editor Options
   */
  editorOptions = {
    theme: 'vs',
    language: 'json',
    minimap: {
      enabled: false
    },
    lineNumbers: 'off'
  };

  editor:string = JSON.stringify(this.expression, null, 2);

  /**
   * Filter Options for tree
   * NOTE: Doesn't work!
   */
  filterAssetTypes: SelectItem[] = [
    { label: 'Regions', value: 'regions' },
    { label: 'VPCs', value: 'VPCs' },
    { label: 'Subnets', value: 'subnets' },
    { label: 'Hosts', value: 'hosts' },
    { label: 'S3 Buckets', value: 's3buckets' },
    { label: 'Collectors', value: 'collectors' }
  ];

  selectedFilters = ['regions', 'VPCs', 'subnets', 'hosts'];
  

  // ===================
  // CARDS
  // ===================
  public AlBaseCardConfig: AlBaseCardConfig = {
    toggleable: true,
    toggleableButton: true,
    checkable: false,
    hasIcon: false
  }

  public assetTreeCardConfig: AlBaseCardConfig = {
    toggleable: true,
    toggleableButton: true,
    checkable: true,
    hasIcon: true
  }

  public assetGroups: AlBaseCardItem[] = [];
  public showBootons:string = '';

  constructor(private assetService: AssetService) {}

  ngOnInit(): void {

    this.assetService.fetchAsync('assets/demo/assets-treenode.json')
      .then(data => {
        this.assets = data;
        this.createTagsList(this.assets);
      })
      .catch(reason => console.log(reason.message));

    this.assetTableCols = [
      { field: 'name', header: 'Name', show: true },
      { field: 'key', header: 'Key', show: false }
    ];

  }

  createTagsList(assets: TreeNode[]) {
    for (const asset of assets) {

      const tags = asset.data.tags;
      for (const key in tags) {

        if (Object.prototype.hasOwnProperty.call(tags, key)) {
          this.tags.push({
            key: key,
            value: tags[key]
          });
        }
        
      }

      const children: TreeNode[] = asset.children || [];
      if (children.length) {
        this.createTagsList(children);
      }
    }
  }

  getParentAssets(nodes: TreeNode[]): {type: string, key: string, name: string}[] {
    let parentAssets: {type: string, key: string, name: string}[] = [];
    for (let i = 0; i < nodes.length; i++) {
      const parent = {type: nodes[i].data.type, key: nodes[i].data.key, name: nodes[i].data.name};
      parentAssets.push(parent);  
    }
    return parentAssets;
  }

  addAssetGroup() {

    let selectedAssetParents = this.getParentAssets(this.selectedNodes);
    let selectedTags = this.selectedTags;
    let selectedGroups = this.selectedGroups;

    let regionCount = selectedAssetParents.filter(asset => asset.type === 'region').length;
    let vpcCount = selectedAssetParents.filter(asset => asset.type === 'vpc').length;
    let subnetCount = selectedAssetParents.filter(asset => asset.type === 'subnet').length;
    let hostCount = selectedAssetParents.filter(asset => asset.type === 'host').length;
    let tagCount = selectedTags.length;
    let groupCount = selectedGroups.length;

    this.assetGroups.push({
      id: String(this.assetGroups.length),
      caption: this.groupName, 
      properties: {
        name: this.groupName,
        created: Date.now(),
        selectedAssets: selectedAssetParents,
        selectedTags: selectedTags,
        selectedGroups: selectedGroups
      },
      footerActions: {right: alEditDeleteFooterActions},
      countItems: [
        {
          number: groupCount,
          text: 'Asset Groups'
        },
        {
          number: regionCount,
          text: 'Regions'
        },
        {
          number: vpcCount,
          text: 'VPCs'
        },
        {
          number: subnetCount,
          text: 'Subnets'
        },
        {
          number: hostCount,
          text: 'Hosts'
        },
        {
          number: tagCount,
          text: 'Tags'
        }
      ],
    });

    this.addGroupToAssets(this.selectedNodes, this.groupName);
    this.selectedNodes = [];
    this.selectedTags = [];
    this.selectedGroups = [];
    this.alBottomSheet.hide();
    this.groupName = '';
    this.criticality = 0;
    this.description = '';
    this.expression = {
      scopes: [
        {
          include: []
        }
      ]
    };

    this.collapseAllNodes(this.assets);
  }
  

  collapseAllNodes(assets: TreeNode[]) {
    for (const asset of assets) {
      asset.expanded = false;

      const children: TreeNode[] = asset.children || [];
      if (children.length) {
        this.collapseAllNodes(children);
      }
    }
  }

  addGroupToAssets(selectedNodes: TreeNode[], name: string, inherited?: boolean | false) {
    
    for (const selectedNode of selectedNodes) {
      if (!inherited) {
        selectedNode.data.groups.push(name);
      } else {
        selectedNode.data.inheritedGroups.push(name);
      }

      if (selectedNode.children) {
        this.addGroupToAssets(selectedNode.children, name, true);
      }
    }
  };

  removeGroup(node: TreeNode, group: string) {
    // find the group's index and remove it from groups
    node.data.groups.splice(node.data.groups.indexOf(group), 1);

    // loop through the children to remove the inherited groups
    for (let i = 0; i < (node.children as TreeNode[]).length; i++) {
      const child = (node.children as TreeNode[])[i];
      child.data.inheritedGroups.splice(child.data.inheritedGroups.indexOf(group));
      
      if (child.children) {
        for (let j = 0; j < (child.children as TreeNode[]).length; j++) {
          const grandChild = (child.children as TreeNode[])[j];
          grandChild.data.inheritedGroups.splice(grandChild.data.inheritedGroups.indexOf(group));

          if (grandChild.children) {
            for (let k = 0; k < (grandChild.children as TreeNode[]).length; k++) {
              const greatGrandChild = (grandChild.children as TreeNode[])[k];
              greatGrandChild.data.inheritedGroups.splice(greatGrandChild.data.inheritedGroups.indexOf(group));
            }
          }
        }
      }
    }
  }

  addNodeParentToExpression(node: TreeNode, scopeIndex: number) {
    const parent: TreeNode = node.parent || {};

    if (parent.data) {
      this.addNodeParentToExpression(parent, scopeIndex);
    } else {
      this.expression.scopes[scopeIndex].include.unshift(node.data.key);
    }

  }

  runExpression() {

    if (this.expression.scopes[0].include.length) {
      this.assetGroupSummary.includes = {
        regions: 2,
        vpcs: 5,
        subnets: 12,
        hosts: 42
      };
    }

    if (this.expression.scopes[0].exclude) {
      this.assetGroupSummary.excludes = {
        regions: 0,
        vpcs: 1,
        subnets: 6,
        hosts: 12
      };
    }
  }

  includeExpression(option: any) {

    const node = {...this.selectedNode};
    console.log(option, node);
    let scopeIndex = 0;

    if (this.expression.scopes[scopeIndex].include.length) {
      this.expression.scopes.push({
        include: []
      });
      scopeIndex = this.expression.scopes.length -1;
    }

    this.expression.scopes[scopeIndex].include.unshift(option.key + ' = ' + option.value);
    this.addNodeParentToExpression(node, scopeIndex);
    this.editor = JSON.stringify(this.expression, null, 2);
  }

  excludeExpression(option: any ) {
    console.log(option);
    let scopeIndex = this.expression.scopes.length -1;

    if (!this.expression.scopes[scopeIndex].exclude) {
      this.expression.scopes[scopeIndex].exclude = [];
    }
    
    this.expression.scopes[scopeIndex].exclude!.unshift(option.key + ' = ' + option.value);
    this.editor = JSON.stringify(this.expression, null, 2);

  }

  nodeSelect(node: TreeNode) {
    this.assetDetails = {
      name: node.data.name || 'N/A',
      key: node.data.key,
      type: node.data.type,
      groups: node.data.groups,
      tags: node.data.tags,
      node: {...node} as TreeNode
    }
    this.selectedNode = node;
  }

  nodeUnselect(event: any) {
    const index = this.expression.scopes[0].include.findIndex(key => key === event.node.data.key);
    this.expression.scopes[0].include.splice(index, 1);
    // NEEDS TO REMOVE ALL PARENT NODES TOO...
  }

  // ===================
  // BOTTOM SHEET
  // ===================
  headerOptions: AlBottomSheetHeaderOptions  = {
    icon:  'group_work',
    title:  'Asset Group',
    collapsibleFromTitle: true,
    primaryAction: {
        text: 'Save',
        disabled:  false,
    },
    secondaryAction:{
        text:  'Cancel',
        disabled:  false
    }
  };

   public save(){
       this.addAssetGroup();
   }

  public cancel() {
      this.alBottomSheet.hide();
  }

  public open() {
      this.alBottomSheet.open();
  }

  public toggle() {
      this.alBottomSheet.toggle();
  }

  
}

