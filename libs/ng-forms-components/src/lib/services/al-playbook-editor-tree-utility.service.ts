import {
    AlResponderAction,
    AlResponderActionLong,
    AlResponderPlaybook,
    AlResponderWorkflow,
    AlResponderWorkflowActionWhen,
    AlResponderWorkflowTask
} from '@al/responder';
import { Injectable } from '@angular/core';
import { AlPlaybookActionTreeNode, AlPlaybookCardIcon, AlTaskPaletteItem } from '../types/playbook-action';
import { v4 as uuidv4 } from 'uuid';
import { Subject } from 'rxjs';
import { SelectItem } from 'primeng/api';

@Injectable({
    providedIn: 'root'
})
export class AlPlaybookEditorTreeUtilityService {

    root = "";
    nodesDictionary: { [key: string]: AlPlaybookActionTreeNode } = {};
    dummyTaskName = "alertlogic_start";
    dummyAction: AlResponderAction = {
        "action": {
            "name": "noop",
            "parameters": {},
            "tags": [],
            "description": "Action that does nothing",
            "pack": "core",
            "ref": "core.noop",
            "id": "alertlogic-dummy-action-core-noop",
            "output_schema": {},
        }
    };
    nodesDictionaryEmitter = new Subject<void>();

    private stashedPlaybook: AlResponderPlaybook | null = null;

    stashPlaybook(playbook: AlResponderPlaybook): void {
        this.stashedPlaybook = playbook;
    }

    getStashedPlaybook(): AlResponderPlaybook | null {
        return this.stashedPlaybook;
    }

    clearPlaybookStash(): void {
        this.stashedPlaybook = null;
    }

    sendDictionaryChanges() {
        this.nodesDictionaryEmitter.next();
    }

    generateNodeId = (action: string = ""): string => {
        let sed = Object.keys(this.nodesDictionary).length;
        let actionId:string = '';

        const actionWithoutSpace = action.replace(/ /g,"_");

        do {
            actionId = actionWithoutSpace + sed;
            sed++;
        }
        while (this.nodesDictionary.hasOwnProperty(actionId));

        return actionId;
    }

    createNodeBase(action: AlResponderAction, taskName: string = ''): AlPlaybookActionTreeNode {
        const newNodeId = taskName ? taskName.replace(/ /g,"_") : this.generateNodeId(action.action.name);
        const newNode = this.createEmptyNodeBase();
        if (newNode.model) {
            newNode.model.config.action = action.action.ref;
            newNode.model.definition = action;
        }
        newNode.card = {
            icon: this.getIcon(this.getVendor(action.action)),
            label: this.getVendor(action.action),
            name: newNodeId,
            taskJoin: false,
            taskWith: false,
            taskDelay: false,
            taskRetry: false
        };
        newNode.id = newNodeId;

        return newNode;
    }

    replaceAction(action: AlResponderAction, nodeKey: string) {
        const node: AlPlaybookActionTreeNode = this.getNode(nodeKey);
        if (!node.card) {
            node.card = {};
        }
        node.card.icon = this.getIcon(this.getVendor(action.action));
        node.card.label = this.getVendor(action.action);
        node.model.config.action = action.action.ref;
        if (node.model.config.input) {
            delete node.model.config.input;
        }
        node.model.definition = action;
        return node;
    }

    replaceRootTask(action: AlResponderAction, oldRootKey: string): AlPlaybookActionTreeNode {
        let newNode = this.createNodeBase(action);
        const node = this.getNode(oldRootKey);
        const oldNode = this.getNode(oldRootKey);

        if (node && node.model && newNode.model) {
            newNode.model.config.next = node.model.config.next;
        }
        this.addNode(newNode);
        this.deleteNodeFromDictionary(oldRootKey);
        if (oldNode) {
            this.relocateJoinsForNode(oldNode);
        }
        this.calculateChildrenConfig(newNode);

        this.root = newNode.id;
        this.sendDictionaryChanges();
        return newNode;
    }

    addRootDummyWithParallel(action: AlResponderAction, oldRootKey?: string) {
        const dummyNode = this.addRootNode(this.dummyAction, oldRootKey, this.dummyTaskName);
        return this.addParallelTask(action, dummyNode.id);
    }

    addRootTask(action: AlResponderAction, oldRootKey?: string): AlPlaybookActionTreeNode {
        const newNode = this.addRootNode(action, oldRootKey, null);
        this.sendDictionaryChanges();
        return newNode;
    }

    addRootDummyTaskWithCondition(): { node: AlPlaybookActionTreeNode, condition: AlResponderWorkflowActionWhen } {
        const newNode = this.addRootNode(this.dummyAction, null, this.dummyTaskName);
        const condition = this.addCondition(newNode.id);
        return {condition, node: newNode};
    }

    addParallelTask(action: AlResponderAction, nodeKey: string): AlPlaybookActionTreeNode {
        let newNode = this.createNodeBase(action);
        const node = this.getNode(nodeKey);
        this.addNode(newNode);
        this.addParallel(node, newNode);
        this.sendDictionaryChanges();
        return newNode;
    }

    addTask(action: AlResponderAction, nodeKey: string): AlPlaybookActionTreeNode {
        const newNode = this.createNodeBase(action);
        const node = this.getNode(nodeKey);

        if (this.hasNext(node)) {
            this.addInTheMiddle(node, newNode);
        } else {
            this.addInTheEnd(node, newNode);
        }
        this.sendDictionaryChanges();

        return newNode;
    }

    joinTask(nodeKey: string, joinWithNodeKey: string) {
        const node = this.getNode(nodeKey);
        const child = this.getNode(joinWithNodeKey);
        // covers parallels
        if (this.hasNext(node)) {
            this.addParallel(node, child);
        } else {// covers leaf nodes
            this.addInTheEnd(node, child);
        }
        this.recalculateJoinPredecessor(child);
        this.sendDictionaryChanges();
    }

    recalculateJoins() {
        const keys = Object.keys(this.nodesDictionary);

        for (let item of keys) { // clean all before to populate
            this.nodesDictionary[item].joins = [];
            this.nodesDictionary[item].joinInto = [];
        }

        for (let item of keys) {
            this.associateJoins(item);// calculate join position
        }

    }

    /** note the condition is a copy of the  node condition but are different objects */
    addTaskInCondition(action: AlResponderAction, condition: AlResponderWorkflowActionWhen, nodeKey: string): AlPlaybookActionTreeNode {
        /*
            node 1
            when a = 1 do
            node 2 < ---- case insert this in condition
        */
        let newNode = this.createNodeBase(action);
        const node = this.getNode(nodeKey);
        const conditionConfig = this.getCondition(node, condition.whenId || '');
        this.addDoInCondition(node, newNode, conditionConfig);
        this.addNode(newNode);

        this.calculateChildrenConfig(node);
        this.sendDictionaryChanges();
        return newNode;
    }

    addJoinInCondition(condition: AlResponderWorkflowActionWhen, nodeKey: string, joinWithNodeKey: string) {
        /*
            node 0 -> node 1 -> nodo 3
                      node 2 has a condition when a = 1

            then
            node 2 -> has a condition when a = 1 do node 3
            node 3 < ---- node 3 already exist and is going to be the join point
            node 0 -> node 1 -------------------------------------> nodo 3
                      node 2 has a condition when a = 1--------------^
        */
        const node = this.getNode(nodeKey);
        const child = this.getNode(joinWithNodeKey);
        const conditionConfig = this.getCondition(node, condition.whenId || '');
        this.addDoInCondition(node, child, conditionConfig);

        this.recalculateJoinPredecessor(child);
        this.sendDictionaryChanges();
    }

    addTaskInConditionReplace(
        action: AlResponderAction,
        condition: AlResponderWorkflowActionWhen,
        nodeKey: string,
        doToReplace: string): AlPlaybookActionTreeNode {
        /*
            node 1
            when a = 1 do node 2
            node x < ---- case insert this in condition

            should do
            node 1
            when a = 1 do node x
            node x do node 2
        */
        let newNode = this.createNodeBase(action);
        const node = this.getNode(nodeKey);
        const nodeToReplace = this.getNode(doToReplace);
        const conditionConfig = this.getCondition(node, condition.whenId || '');
        this.replaceDo(node, newNode.id, conditionConfig, doToReplace);
        this.addNode(newNode);
        this.addDo(newNode, nodeToReplace);

        this.calculateChildrenConfig(node);
        this.calculateChildrenConfig(newNode);
        this.sendDictionaryChanges();
        return newNode;
    }

    addNextForPublish(node: AlPlaybookActionTreeNode) {
        // add the empty next if the node does not have one
        if (!node.model.config.next || node.model.config.next?.length === 0) {
            node.model.config.next = [
                {when: '' /*, do: [] */}
            ];
        }
    }

    addNode(node: AlPlaybookActionTreeNode) {
        this.nodesDictionary[node.id] = node;
    }

    getNode(nodeId: string): AlPlaybookActionTreeNode {
        return this.nodesDictionary[nodeId];
    }

    getConditionIndex(node: AlPlaybookActionTreeNode, conditionWhenId: string): number {
        return node.model.config.next?.findIndex(condition => condition.whenId === conditionWhenId) ?? -1;
    }

    deleteCondition(node: AlPlaybookActionTreeNode, conditionCopy: AlResponderWorkflowActionWhen) {
        const conditionIndex = this.getConditionIndex(node, conditionCopy.whenId || '');
        const conditionConfig = this.getCondition(node, conditionCopy.whenId || ''); // condition in model

        if (conditionIndex !== -1 && node.model.config.next) {
            if (node.model.config.next.length === 1) {
                node.model.config.next[0].when = "";
                this.calculateChildrenConfig(node);
            } else {
                node.model.config.next.splice(conditionIndex, 1); // remove the condition

                if (conditionConfig && conditionConfig.do) {
                    this.deleteDecendents(conditionConfig.do);
                }

                if (conditionCopy.doOut && conditionCopy.doOut.length) {
                    conditionCopy.doOut.forEach(doOut => {
                        this.recalculateJoinPredecessor(this.getNode(doOut));
                    });
                }

                this.addNextForPublish(node);
            }
        }

        this.calculateChildrenConfig(node);
        this.sendDictionaryChanges();
    }

    associateMetaGraphWithDictionary() {
        const keys = Object.keys(this.nodesDictionary);

        for (let item of keys) { // clean all before to populate
            this.nodesDictionary[item].successors = [];
            this.nodesDictionary[item].predecessor = [];
        }

        for (let item of keys) {
            this.associateMetaGraph(item);
        }
    }

    deleteDoInNode(node: AlPlaybookActionTreeNode, doToDelete: string, conditionCopy: AlResponderWorkflowActionWhen | undefined) {
        if (node.model && node.model.config.next) {
            node.model.config.next.forEach(condition => {
                if (conditionCopy && condition.whenId !== conditionCopy.whenId) {
                    return;
                }
                let oldDoIndex = condition.do?.findIndex(doItem => {
                    return doItem === doToDelete;
                }) || 0;

                if (oldDoIndex >= 0 && condition.do) {
                    // delete from origin object in  the task
                    condition.do.splice(oldDoIndex, 1); // delete the do
                    // This is to avoid do:[] after the children deleted
                    if (condition.do.length === 0) {
                        delete condition.do;
                    }
                }
            });
        }
        this.addNextForPublish(node);
    }

    deleteDoAndConnectParentAndChild(node: AlPlaybookActionTreeNode, doToDelete: string, doToInsert: string) {
        node.model.config.next?.forEach(condition => {
            let oldDoIndex = condition.do?.findIndex(doItem => {
                return doItem === doToDelete;
            }) || 0;

            if (oldDoIndex >= 0 && condition.do) {
                condition.do[oldDoIndex] = doToInsert;
            }
        });
    }

    deleteDecendents(nextNodes: string[]) {
        const nodesToKillWihtMultiParent: AlPlaybookActionTreeNode[] = []; // join
        const nodesToKill: AlPlaybookActionTreeNode[] = [];
        nextNodes.forEach(item => {
            this.getNodeDown(item, nodesToKill, nodesToKillWihtMultiParent);
        });

        nodesToKill.forEach(nodeInHirarchy => {
            this.deleteNodeFromDictionary(nodeInHirarchy.id);
        });

        nodesToKillWihtMultiParent.forEach(nodeInHierarchy => {
            let parentWithLive = 0;
            nodeInHierarchy.predecessor?.forEach(parent => {
                if (this.nodesDictionary[parent]) {
                    parentWithLive++;
                }
            });
            if (parentWithLive === 0) {
                const nodeSucessors: string[] = nodeInHierarchy.successors ?? [];
                if (nodeSucessors.length > 0) {
                    this.deleteDecendents(nodeSucessors);
                }
                this.deleteNodeFromDictionary(nodeInHierarchy.id);
            }
        });

    }

    deleteNextMultiparent(parentTask: AlPlaybookActionTreeNode, doIdToDelete: string) {
        this.deleteFromMultiParent(parentTask, doIdToDelete, undefined);
    }

    deleteNextMultiparentInCondition(parentTask: AlPlaybookActionTreeNode, doIdToDelete: string, conditionCopy: AlResponderWorkflowActionWhen) {
        this.deleteFromMultiParent(parentTask, doIdToDelete, conditionCopy);

        // replicate the changes in the copy
        let freshCopy = parentTask.conditions?.find(item => item.whenId === conditionCopy.whenId);
        // delete from copy
        if (freshCopy) {
            conditionCopy.do = freshCopy.do;
            conditionCopy.doOut = freshCopy.doOut;
        }
    }

    deleteNode(node: AlPlaybookActionTreeNode) {
        this.associateMetaGraphWithDictionary();
        let previousNodes: string[] = node.predecessor ?? [];
        let nextNodes: string[] = node.successors ?? [];

        // case dealing with root
        if (previousNodes.length === 0) {

            // case 1 no previous and no next
            if (nextNodes.length === 0) {
                this.root = "";
            }
            // case 2 has a next but not previous
            if (nextNodes.length === 1) {
                this.root = nextNodes[0];
            }
            // case 3 has several next
            if (nextNodes.length > 1) {
                this.root = "";
                this.deleteDecendents(nextNodes);
            }
            this.deleteNodeFromDictionary(node.id);
        }

        if (previousNodes.length === 1) {
            const previous = this.getNode(previousNodes[0]);
            // case 1 has a previous but not next
            if (nextNodes.length === 0) {
                // node 1 target to node 2
                // node 2 (delete this)
                this.deleteDoInNode(previous, node.id, undefined);
            }

            // case 2 has a previous and has a next
            if (nextNodes.length === 1) {
                // if the node 3 is not a multiparent
                // node 1 target to node 2
                // node 2 target to node 3 (delete this)
                // node 3
                // then node 1 target to node 3

                // else just delete the relation and the node
                let multiParent = this.getNode(nextNodes[0]);

                if (multiParent && multiParent.predecessor && multiParent.predecessor.length > 1) { // join
                    this.deleteDoInNode(previous, node.id, undefined);
                    this.deleteDoInNode(node, multiParent.id, undefined);
                    this.recalculateJoinPredecessor(multiParent);
                } else {
                    this.deleteDoAndConnectParentAndChild(previous, node.id, nextNodes[0]);
                }
            }

            // case 3 has a previous  and the node is a parallel or a condition
            // delete all under those
            if (nextNodes.length > 1) {
                this.deleteDecendents(nextNodes);
                this.deleteDoInNode(previous, node.id, undefined);
            }
            this.deleteNodeFromDictionary(node.id);
            this.calculateChildrenConfig(previous);
        }

        if (previousNodes.length > 1) { // join case

            if (nextNodes.length === 1) {
                let child = nextNodes[0];
                this.replaceDoInParents(previousNodes, node.id, child);
                this.changeTaskInContainer(node.id, child);
                this.associateMetaGraphWithDictionary();
            } else {
                if (nextNodes.length > 1) {
                    this.deleteDecendents(nextNodes);
                }
                previousNodes.forEach(previousId => {
                    const previous = this.getNode(previousId);
                    this.deleteDoInNode(previous, node.id, undefined);
                });
                this.deleteJoinInContainerPosition(node.id);
            }
            this.recalculateParentsChildrenConfig(previousNodes);
            this.deleteNodeFromDictionary(node.id);
        }
        this.sendDictionaryChanges();
    }

    inheritFromChild(node: AlPlaybookActionTreeNode) {
        /* if this is here is because
        task X
        ---> task 0
        ------> task A
        ------> task B
        and we want to delete "task 0" but we want task X inherit the task a and task b
        task X
        ---> task A
        ---> task B
        */
        // associateMetaGraphWithDictionary() is required but is done in getPosibbleHeir
        let previousNodes = node.predecessor;
        let previous;

        // case dealing with root
        if (previousNodes && previousNodes.length === 0) {
            previous = this.addRootNode(this.dummyAction, null, this.dummyTaskName);
        }

        if (previousNodes && previousNodes.length === 1) {
            previous = this.getNode(previousNodes[0]);
            this.deleteDoInNode(previous, node.id, undefined);
        }

        if (previous) {
            if (this.hasConditions((node))) {
                this.inheritConditions(node, previous);
            } else {
                this.inheritParallel(node, previous);
            }
            this.deleteNodeFromDictionary(node.id);
            this.calculatePositionsOfNodeAndChildren(previous);
            this.relocateJoinsForNode(node);
            this.sendDictionaryChanges();
        }

    }

    relocateJoinsForNode(node: AlPlaybookActionTreeNode): void {
        const nodeJoins = node.joins ?? [];
        const nodeJoinInTo = node.joinInto ?? [];
        if (nodeJoins.length > 0 || nodeJoinInTo.length > 0) {
            nodeJoins.forEach(key => {
                let join = this.getNode(key);
                this.recalculateJoinPredecessor(join);
            });

            nodeJoinInTo.forEach(key => {
                let join = this.getNode(key);
                this.recalculateJoinPredecessor(join);
            });
        }
    }

    deleteTaskWithReplace(node: AlPlaybookActionTreeNode, replaceNodeId: string) {
        /* if this is here is because
        task 0
        ----> task A
        ----> task B
        and we want to delete "task 0" but make one of the child to take his place
        This only happend for task with multiple children
        after the deletion , lets say the "task A" is going to take "task 0" place
        task A
        ----> task B
        */
        // associateMetaGraphWithDictionary() is required but is done in getPosibbleHeir
        let previousNodes = node.predecessor;
        let heir = this.getNode(replaceNodeId);

        // case dealing with root
        if (previousNodes) {
            if (previousNodes.length === 0) {
                this.root = replaceNodeId;
            }
            if (previousNodes.length > 0) {
                this.replaceDoInParents(previousNodes, node.id, replaceNodeId);
            }
        }

        this.deleteDoInNode(node, replaceNodeId, undefined);
        if (this.hasConditions((node))) {
            this.inheritConditions(node, heir);
        } else {
            this.inheritParallel(node, heir);
        }
        this.deleteNodeFromDictionary(node.id);
        this.calculatePositionsOfNodeAndChildren(heir);
        this.sendDictionaryChanges();
    }

    getJoinContainer(taskId: string) {
        // find the parent node that has the task Id as a join
        return Object.keys(this.nodesDictionary).find(key => this.nodesDictionary[key].joins?.includes(taskId));
    }

    deleteJoinInContainerPosition(taskId: string) {
        const nodeContainerKey = this.getJoinContainer(taskId);

        if (nodeContainerKey && Array.isArray(this.nodesDictionary[nodeContainerKey].joins)) {
            const index = this.nodesDictionary[nodeContainerKey].joins?.findIndex(item => item === taskId) ?? -1;
            if (index !== -1) {
                this.nodesDictionary[nodeContainerKey].joins?.splice(index, 1);
            }
        }
    }

    deleteNodeFromDictionary(nodeKey: string) {
        // delete the node
        delete this.nodesDictionary[nodeKey];
    }

    deleteAllNodes() {
        this.nodesDictionary = {};
    }

    cleanTask(node: AlPlaybookActionTreeNode): AlResponderWorkflowTask {
        const task: AlResponderWorkflowTask = node.model.config;
        const taskOut: AlResponderWorkflowTask = {};
        taskOut.action = task.action;

        if (task.input) {
            taskOut.input = task.input;
        }
        if (task.next) {
            const nextOut = task.next.filter(next => {
                return (next.do && next.do.length) || (next.publish && next.publish.length > 0);
            });

            if (nextOut.length > 0) {
                taskOut.next = nextOut.map(next => {
                    let cloned: AlResponderWorkflowActionWhen = {};
                    // TODO improve this
                    if (next.x_alertlogic_condition_name) {
                        cloned.x_alertlogic_condition_name = next.x_alertlogic_condition_name;
                    }
                    if (next.do) {
                        cloned.do = next.do;
                    }
                    if (next.when) {
                        cloned.when = next.when;
                    }
                    if (next.publish) {
                        cloned.publish = next.publish;
                    }
                    return cloned;
                });
            }
        }
        if (task.with) {
            taskOut.with = task.with;
        }

        if (task.join) {
            taskOut.join = task.join;
        }

        if (task.retry) {
            taskOut.retry = task.retry;
        }

        if (task.delay) {
            taskOut.delay = task.delay;
        }
        return taskOut;
    }

    printNodes(): {[key: string]: AlResponderWorkflowTask} {
        this.associateMetaGraphWithDictionary();
        const taskOut: {[key: string]: AlResponderWorkflowTask} = {};
        const taskKeys = Object.keys(this.nodesDictionary);
        taskKeys.forEach(taskKey => {
            taskOut[taskKey] = this.cleanTask(this.nodesDictionary[taskKey]);
        });
        return taskOut;
    }

    onAddConditionOverTask(doNode: AlPlaybookActionTreeNode): { node: AlPlaybookActionTreeNode, condition: AlResponderWorkflowActionWhen } {
        const node = this.addRootNode(this.dummyAction, null, this.dummyTaskName);
        this.addDo(node, doNode);
        const condition = this.addCondition(node.id);

        return {node, condition};
    }

    addCondition(nodeId: string): AlResponderWorkflowActionWhen {

        // find node to add condition
        let node = this.getNode(nodeId);
        let condition;
        // node.condition = true;
        // if a condition let add a default success
        if (!node.model.config.next) {
            node.model.config.next = [];
        }

        if (this.hasConditions(node) || node.model.config.next.length === 0) {
            // case 1
            // node 1 with not next
            condition = this.addNewCondition(node);
        } else if (/*(this.hasParallel(node) || this.hasNext(node)) &&*/ node.model.config.next.length === 1) {
            // if this already has a next with a do
            // case 2
            // node 1 do a, b, c  but not conditions and we added a condition
            let whenExp = node.model.config.next[0];
            whenExp.when = "<% succeeded() %>";
            whenExp.whenId = uuidv4();
            condition = whenExp;
        } else {
            // case 3
            // node 1 condition a=1, b=1
            // new condition
            condition = this.addNewCondition(node);
        }

        this.calculateChildrenConfig(node);
        this.sendDictionaryChanges();
        return condition;
    }

    hasConditions(node: AlPlaybookActionTreeNode) {
        return this.evaluateInCondition(node, (condition: AlResponderWorkflowActionWhen) => condition.when && condition.when !== '');
    }

    hasParallel(node: AlPlaybookActionTreeNode) {
        return this.evaluateInCondition(node, (condition: AlResponderWorkflowActionWhen) => condition?.do && condition.do.length > 1);
    }

    hasNext(node: AlPlaybookActionTreeNode) {
        return this.evaluateInCondition(node, (condition: AlResponderWorkflowActionWhen) => condition?.do && condition.do.length > 0);
    }

    calculateChildrenConfig(node: AlPlaybookActionTreeNode) {

        if (!node) {
            return;
        }
        let parallels: string[] = [];
        let parallelsOut: string[] = [];
        let conditions: AlResponderWorkflowActionWhen[] = [];
        let nextConditions: AlResponderWorkflowActionWhen[] = node?.model?.config?.next as AlResponderWorkflowActionWhen[];
        if (nextConditions) {
            nextConditions.forEach(condition => {
                if (condition.when && condition.when !== '') {

                    let conditionCopy: AlResponderWorkflowActionWhen = {
                        when: condition.when,
                        whenId: condition.whenId,
                        do: [],
                        doOut: [],
                        publish: condition.publish
                    };

                    conditionCopy.x_alertlogic_condition_name = condition?.x_alertlogic_condition_name || '';

                    condition.do?.forEach(doItem => {
                        if (this.nodesDictionary[doItem]) {
                            const predecessor = this.nodesDictionary[doItem].predecessor ?? [];
                            if (predecessor.length <= 1) {
                                // if is not a multiparent
                                conditionCopy.do?.push(doItem);
                            } else {
                                conditionCopy.doOut?.push(doItem);
                                // condition with next but the next is a join
                            }
                        } else {
                            console.log("we could not found task id", doItem, node);
                        }
                    });
                    conditions.push(conditionCopy);
                } else {
                    if (condition.do) {
                        // parallel
                        condition.do.forEach(doItem => {
                            if (this.nodesDictionary[doItem]) {
                                const predecessor = this.nodesDictionary[doItem].predecessor ?? [];
                                if (predecessor.length <= 1) { // if is not a multiparent
                                    parallels.push(doItem);
                                } else {
                                    parallelsOut.push(doItem);
                                    // parallel but is a join
                                }
                            } else {
                                console.log("we could not found task id", doItem, node);
                            }
                        });
                    }
                }
            });
        }
        node.parallels = parallels;
        node.parallelsOut = parallelsOut;
        node.conditions = conditions;
    }

    hasPublished(node: AlPlaybookActionTreeNode) {
        return node.model.config.next?.find(condition => condition.publish && condition.publish.length > 0) ? true : false;
    }

    setEmptyNext(node: AlPlaybookActionTreeNode) {
        if (node.model.config && !node.model.config.hasOwnProperty('next')) {
            node.model.config.next = [];
        }
    }

    setEmptyDo(node: AlPlaybookActionTreeNode) {
        if (node.model.config.next?.length === 1) {
            if (!node.model.config.next[0].hasOwnProperty('do')) {
                node.model.config.next[0].do = [];
            }
        }
    }

    // this is for a node with parallel
    addDo(node: AlPlaybookActionTreeNode, newNode: AlPlaybookActionTreeNode) {
        this.setEmptyNext(node);

        if (node.model.config.next && node.model.config.next?.length === 0) {
            const condition: AlResponderWorkflowActionWhen = {
                do: [newNode.id],
                whenId: uuidv4()
            };
            node.model.config.next.push(condition);
        } else {
            this.setEmptyDo(node);
            if(node.model.config.next && node.model.config.next[0].do){
                node.model.config.next[0].do.push(newNode.id);
            }
        }
    }

    getCondition(node: AlPlaybookActionTreeNode, conditionId: string): AlResponderWorkflowActionWhen | undefined {
        return node.model.config.next?.find(condition => condition.whenId === conditionId);
    }

    addDoInCondition(node: AlPlaybookActionTreeNode, newNode: AlPlaybookActionTreeNode, conditionConfig?: AlResponderWorkflowActionWhen) {
        this.setEmptyNext(node);

        if (conditionConfig) {
            if (!conditionConfig.do) {
                conditionConfig.do = [];
            }
            conditionConfig.do.push(newNode.id);
        }
    }

    replaceDo(node: AlPlaybookActionTreeNode, newNodeId: string, condition?: AlResponderWorkflowActionWhen, oldNodeId?: string) {
        this.setEmptyNext(node);
        if (node.model.config.next?.length === 0) {
            const when: AlResponderWorkflowActionWhen = {
                do: [newNodeId] // urgent
            };
            node.model.config.next.push(when);
        } else {
            // if the action has a when without do and wothout next and has publish stuff merge that in the new action
            if (/*this.hasPublished(node) && */ node.model.config.next && !this.hasParallel(node) && !this.hasConditions(node)) {
                node.model.config.next[0].do = [newNodeId]; // urgent
            } else if (this.hasConditions(node) && condition && condition.do) {
                let doIndex = condition.do.findIndex(item => item === oldNodeId);
                if (doIndex >= 0) {
                    condition.do[doIndex] = newNodeId;
                }
            } else if (this.hasParallel(node)) {
                if (node.model.config.next && this.hasNext(node)) {
                    node.model.config.next[0].do = [newNodeId]; // urgent
                } else {
                    console.warn("case not covered");
                }
            }
        }
    }

    hasJoin(node: AlPlaybookActionTreeNode) {
        return !!node.model.config.join;
    }

    // use just in load
    foundCommonParent(nodeId: string, acc: string[]): string[] {
        let node = this.nodesDictionary[nodeId];
        if (node) {
            acc.push(nodeId);
        }

        if (node.predecessor && node.predecessor.length > 0) {
            node.predecessor.forEach(parent => {
                // when we have a node with multiple parent we just need one root up
                this.foundCommonParent(parent, acc);
            });
        }
        return acc;
    }

    // use just in load
    foundCommonKey(paths: string[][]): string | null {
        // require an array with unless 2 arrays in it
        let firstPath = paths[0];

        for (let i = 0; i < firstPath.length; i++) {

            let nodeId = firstPath[i];
            let count = 1;
            for (let j = 1; j < paths.length; j++) {
                if (paths[j].includes(nodeId)) {
                    count++;
                }
            }

            if (paths.length === count) {
                return nodeId;
            }
        }
        return null;
    }

    newWorkflow(actionsList: AlResponderAction[]) {
        this.cleanWorkflow();
        this.sendDictionaryChanges();
    }

    cleanWorkflow() {
        this.nodesDictionary = {}; // clean all
        this.root = "";
    }

    // use just in load
    loadWorkFlow(workflow: AlResponderWorkflow, actionsList: AlResponderAction[]) {
        this.cleanWorkflow();
        const actionDictionary = this.createActionDictionary(actionsList);

        if (workflow.hasOwnProperty('tasks')) {
            const taskDictionary = workflow.tasks || {};
            const taskKeys: string[] = Object.keys(taskDictionary);
            // first make the whole dictionary
            taskKeys.forEach(taskKey => {
                this.createWorkflowNode(taskKey, taskDictionary, actionDictionary);
            });

            // find predecessor and successors
            taskKeys.forEach(taskKey => {
                this.associateMetaGraph(taskKey);
            });
            taskKeys.forEach(taskKey => {
                this.calculateChildrenConfig(this.nodesDictionary[taskKey]);
            });
            taskKeys.forEach(taskKey => {
                this.associateJoins(taskKey);
            });

            const rootNode = this.findRoot();
            this.root = rootNode?.id || "";
        }
        this.sendDictionaryChanges();
    }

    changeNodeModel(task: AlResponderWorkflowTask, nodeId: string, isCondition: boolean): void {
        const node = this.nodesDictionary[nodeId];

        if (!isCondition && node.card) {
            node.card.taskJoin = false;
            node.card.taskWith = false;
            if (task.hasOwnProperty('input') && Object.keys(task.input || {}).length > 0) {
                node.model.config.input = task.input;
            }

            if (task.hasOwnProperty('with') && Object.keys(task.with || {}).length > 0) {
                node.model.config.with = task.with;
                node.card.taskWith = true;
            } else {
                if (node.model.config.hasOwnProperty('with')) {
                    delete node.model.config.with;
                }
            }

            if (task.hasOwnProperty('join')) {
                node.model.config.join = task.join;
                node.card.taskJoin = true;
            } else {
                if (node.model.config.hasOwnProperty('join')) {
                    delete node.model.config.join;
                }
            }

            if (task?.retry) {
                node.model.config.retry = task.retry;
                node.card.taskRetry = true;
            } else {
                if (node.model?.config?.retry) {
                    delete node.model.config.retry;
                }
            }

            if (task?.delay) {
                node.model.config.delay = task.delay;
                node.card.taskDelay = true;
            } else {
                if (node.model?.config?.delay) {
                    delete node.model.config.delay;
                }
            }
        }

        if (task.hasOwnProperty('next') && node.model) {
            node.model.config.next = task.next;
            this.calculateChildrenConfig(node);
        }
        this.sendDictionaryChanges();

        // TODO: review if we have some stuff publish if so get the keys and add to var if necessary
    }

    deleteDuplicateString(data: string[]) {
        const newList = new Set(data);
        return [...newList];
    }

    // refactor to dont use  previous and next list, index
    changeTaskName(currentName: string, newName: string) {
        this.associateMetaGraphWithDictionary();

        const node = this.nodesDictionary[currentName];
        node.id = newName;
        if (node.card) {
            node.card.name = newName;
        } else {
            node.card = {name: newName};
        }
        this.nodesDictionary[newName] = node;
        delete this.nodesDictionary[currentName];

        let previousNodes = node.predecessor || [];
        // go to parent and change the do reference
        if (previousNodes.length > 0) {
            const previousNodesCleaned = this.deleteDuplicateString(previousNodes);
            previousNodesCleaned.forEach(nodeId => {
                let previousNode = this.nodesDictionary[nodeId];
                if (previousNode.model?.config?.next) {

                    // search for next
                    previousNode.model.config.next.forEach(
                        next => {
                            if (next.do?.includes(currentName)) {
                                const doIndex = next.do?.findIndex(item => item === currentName);
                                if (doIndex >= 0) {
                                    next.do[doIndex] = newName;
                                }
                            }
                        }
                    );
                    this.calculateChildrenConfig(previousNode);

                }
            });
        }

        this.calculateChildrenConfig(node);

        if (previousNodes.length > 1) {
            this.changeTaskInContainer(currentName, newName);
        }

        if (currentName === this.root) {
            this.root = newName;
        }
        this.sendDictionaryChanges();
        // TODO when this happen we should go in all the tree down and replace references? example context
    }

    public getVendorFromNode(nodeId: string) {
        const node = this.getNode(nodeId);
        return node.model.definition ? this.getVendor(node.model.definition.action) : '';
    }

    public getVendor(action: AlResponderActionLong) {
        return action.tags?.find(x => x.name === "vendor")?.value || '';
    }

    public getJoinOptions(nodeKey: string) {
        this.associateMetaGraphWithDictionary();
        // let say to avoid cicles all nodes are possible next except the ones
        // that are in the path to root of this node
        const list = Object.keys(this.nodesDictionary);
        let pathToRoot: string[] = [];
        this.foundCommonParent(nodeKey, pathToRoot);

        const brothers = this.getBrothers(nodeKey);
        // exclude brothers and avoid cicles
        const allowedDo: string[] = list.filter(taskId => !pathToRoot.includes(taskId))
            .filter(taskId => !brothers.includes(taskId));


        // create the struture for palette
        this.getNode(nodeKey).joinOptions = allowedDo.map(doId => this.createTaskPaletteItemFromId(doId));
    }

    public getAddOptions(actions: AlResponderAction[]) {
        return actions.map(item => this.createTaskPaletteItemFromAction(item));
    }

    getIcon(vendor: string): AlPlaybookCardIcon {
        let icon: AlPlaybookCardIcon;
        switch (vendor) {
            case "Condition":
                icon = {name: "help", color: "#868686"};
                break;
            case "Alert Logic":
                icon = {cssClasses: "al al-logo", color: "#535353"};
                break;
            case "AWS":
                icon = {cssClasses: "al al-aws", color: "#FFA800"};
                break;
            case "HTTP":
                icon = {cssClasses: "al al-generic-http", color: "#005092"};
                break;
            case "Microsoft":
                icon = {cssClasses: "al al-ms-teams", color: "#464874"};
                break;
            case "Slack":
                icon = {cssClasses: "al al-slack", color: "#411542"};
                break;
            case "ServiceNow":
                icon = {cssClasses: "al al-service-now", color: "#7faf9d"};
                break;
            case "PagerDuty":
                icon = {cssClasses: "al al-pagerduty", color: "#06ac38"};
                break;
            case "Zendesk":
                icon = {cssClasses: "al al-zendesk", color: "#17494d"};
                break;
            case "General Operation":
                icon = {name: "playlist_play", color: "#535353"};
                break;
            case "Web App Security Integration":
                icon = {name: "smart_display", color: "#535353"};
                break;
            case "Palo Alto Networks":
                icon = {cssClasses: "al al-palo-alto", color: "#fa582d"};
                break;
            default:
                icon = {name: "extension", color: "#535353"};
                break;
        }
        return icon;
    }

    public getPosibbleHeir(node: AlPlaybookActionTreeNode) {
        let heirCandicate: SelectItem[] = [];
        this.associateMetaGraphWithDictionary();
        node.successors?.forEach(successorKey => {
            let successor = this.getNode(successorKey);
            let disabled = false;
            if (successor.predecessor && successor.predecessor.length > 1) {
                disabled = true;
            }
            heirCandicate.push({label: successorKey, value: successorKey, disabled: disabled});
        });
        return heirCandicate;
    }

    private createEmptyNodeBase(): AlPlaybookActionTreeNode {
        const newNodeId = this.generateNodeId("task_new");
        const newNode: AlPlaybookActionTreeNode = {
            id: newNodeId,
            model: {
                definition: undefined,
                config: {},
            },
            predecessor: [],
            successors: [],
            joins: [],
            joinInto: [],
            parallels: [],
            conditions: [],
            parallelsOut: [],
            joinOptions: [],
            card: {}
        };

        this.addNextForPublish(newNode);
        return newNode;
    }

    private addRootNode(action: AlResponderAction, oldRootKey?: string | null, suggestedTaskId?: string | null) {
        const name = suggestedTaskId ? this.generateNodeId(suggestedTaskId) : undefined;
        let newNode = this.createNodeBase(action, name);

        let node;
        if (oldRootKey) {
            node = this.getNode(oldRootKey);
        }
        if (node) {
            this.addDo(newNode, node);
        }
        this.addNode(newNode);
        this.calculateChildrenConfig(newNode);

        this.root = newNode.id;
        return newNode;
    }

    private addParallel(node: AlPlaybookActionTreeNode, childNode: AlPlaybookActionTreeNode) {
        this.addDo(node, childNode);
        this.calculateChildrenConfig(node);
    }

    private addInTheMiddle(node: AlPlaybookActionTreeNode, childNode: AlPlaybookActionTreeNode) {
        /*
            node 1
            node 3 < ---- case insert
            node 2
            */
        if (node.model && node.model.config.next) {
            node.model.config.next.forEach(nextItem => {
                nextItem.do?.forEach(doItem => {
                    const nodeTemp = this.getNode(doItem);
                    this.addDo(childNode, nodeTemp);
                });
            });
        }

        this.replaceDo(node, childNode.id);
        this.addNode(childNode);
        this.calculateChildrenConfig(node);
        this.calculateChildrenConfig(childNode);
    }

    private addInTheEnd(node: AlPlaybookActionTreeNode, childNode: AlPlaybookActionTreeNode) {
        /*
        node 1
        node 2 < ---- case insert this
        */
        this.addDo(node, childNode);
        this.addNode(childNode);
        this.calculateChildrenConfig(node);
    }

    private recalculateJoinPredecessor(node: AlPlaybookActionTreeNode) {
        this.associateMetaGraphWithDictionary();
        this.recalculateJoins();
        node.predecessor?.forEach(parentId => {
            const parentNode = this.getNode(parentId);
            if (parentNode) {
                this.calculateChildrenConfig(parentNode);
            }
        });
    }

    private deleteFromMultiParent(parentTask: AlPlaybookActionTreeNode, doIdToDelete: string, conditionCopy: AlResponderWorkflowActionWhen | undefined) {

        // delete in the dictionary
        const node = this.getNode(parentTask.id);
        this.deleteDoInNode(node, doIdToDelete, conditionCopy);
        this.calculateChildrenConfig(node);

        const multiparent = this.getNode(doIdToDelete);
        this.recalculateJoinPredecessor(multiparent);
        this.sendDictionaryChanges();
    }

    private recalculateParentsChildrenConfig(previousNodes: string[]) {
        previousNodes.forEach(previousId => {
            const previous = this.getNode(previousId);
            this.calculateChildrenConfig(previous);
        });
    }

    private replaceDoInParents(previousNodes: string[], oldNodeId: string, replaceNodeId: string) {
        previousNodes.forEach(parentKey => {
            const previous = this.getNode(parentKey);
            this.deleteReplaceDo(previous, oldNodeId, replaceNodeId);
            this.calculateChildrenConfig(previous);
        });
    }

    private calculatePositionsOfNodeAndChildren(node: AlPlaybookActionTreeNode) {
        this.associateMetaGraphWithDictionary();
        if (node.predecessor && node.predecessor.length > 1) {// join
            this.recalculateJoinPredecessor(node);
        }
        node.successors?.forEach(successorKey => {
            const successor = this.getNode(successorKey);
            if (successor.predecessor && successor.predecessor.length > 1) {// join
                this.recalculateJoinPredecessor(successor);
            }
            this.calculateChildrenConfig(successor);
        });
        this.calculateChildrenConfig(node);
    }

    private inheritParallel(nodeParent: AlPlaybookActionTreeNode, nodeChild: AlPlaybookActionTreeNode) {
        let when: AlResponderWorkflowActionWhen;
        if (this.hasConditions((nodeChild))) {
            // If the heir node has condictions, let create a empty condition to put all this father inherit
            // else just add the parent children as children of the heir
            when = this.addCondition(nodeChild.id);
        }
        nodeParent.model?.config.next?.forEach(condition => {
            if (condition.do && condition.do.length > 0) {
                condition.do.forEach(doTask => {
                    if (when) {
                        const newChild = this.getNode(doTask);
                        this.addDoInCondition(nodeChild, newChild, when);
                    } else {
                        const newChild = this.getNode(doTask);
                        this.addDo(nodeChild, newChild);
                    }
                });
            }
        });
    }

    private inheritConditions(nodeParent: AlPlaybookActionTreeNode, nodeChild: AlPlaybookActionTreeNode) {
        /**
         * If the heir has conditions just add the parent conditions to it
         * else create a condition and put all he already has in it, and then add the parent conditions
         */
        if (!this.hasConditions((nodeChild))) {
            this.addCondition(nodeChild.id);
        }

        nodeParent.model?.config.next?.forEach(condition => {
            if (condition.do && condition.do.length > 0) {
                nodeChild.model?.config.next?.push(condition);
            }
        });
    }

    private addNewCondition(node: AlPlaybookActionTreeNode): AlResponderWorkflowActionWhen {
        let when: AlResponderWorkflowActionWhen = {when: "<% succeeded() %>", do: []};
        when.whenId = uuidv4();
        node.model.config.next?.push(when);

        return when;
    }

    private evaluateInCondition(node: AlPlaybookActionTreeNode, callback: (condition: AlResponderWorkflowActionWhen) => boolean | string | undefined) {
        let nextConditions: AlResponderWorkflowActionWhen[] = node.model.config.next ?? [];

        if (nextConditions) {
            if (nextConditions.find(callback)) {
                return true;
            }
        }
        return false;
    }

    private deleteReplaceDo(node: AlPlaybookActionTreeNode, oldNodeId: string, newNodeId: string) {
        node.model.config.next?.forEach(condition => {
            if (condition.do) {
                let doIndex = condition.do.findIndex(item => {
                    return item === oldNodeId;
                });
                if (doIndex >= 0) {
                    condition.do[doIndex] = newNodeId;
                }
            }
        });
    }

    private findRoot() {
        // lest say the root is one task that is not invoke in the other task
        // once we have the trigger we can say the root the task that is trigger
        let root = null;
        for (const nodeKey of Object.keys(this.nodesDictionary)) {
            const predecessor = this.nodesDictionary[nodeKey].predecessor ?? [];
            if (predecessor.length === 0) {
                root = this.nodesDictionary[nodeKey];
                console.log("possible parent", this.nodesDictionary[nodeKey]);
            }
        }
        return root;
    }

    private createWorkflowNode(
        taskKey: string,
        taskDictionary: { [key: string]: AlResponderWorkflowTask },
        actionDictionary: { [key: string]: AlResponderAction },
    ): AlPlaybookActionTreeNode {
        let taskAction = taskDictionary[taskKey].action ?? '';
        if (!actionDictionary.hasOwnProperty(taskAction)) {
            // lest try using other method
            const words = taskAction.split(" ");
            if (words.length > 0) {
                taskAction = words[0];
                if (!actionDictionary.hasOwnProperty(taskAction)) {
                    taskAction = actionDictionary['built_in.noop'] ? 'built_in.noop' : 'core.noop';
                    const msg = `we could not find this action ${taskKey} on the dictionary, `
                        + `we are going to replace with ${taskAction}, but with this action, the task could lost data.`;
                    console.warn(msg, taskKey);
                }
            }
        }
        const newNode = this.createNodeBase(
            actionDictionary[taskAction],
            taskKey
        );
        // assing the task id
        newNode.id = taskKey; // important!!!
        // assing the task configuration
        newNode.model.config = this.processNext(taskDictionary[taskKey]);
        if (!newNode.card) {
            newNode.card = {};
        }
        newNode.card.taskJoin = newNode.model.config.hasOwnProperty('join');
        newNode.card.taskWith = newNode.model.config.hasOwnProperty('with');
        newNode.card.taskDelay = newNode.model.config.hasOwnProperty('delay');
        newNode.card.taskRetry = newNode.model.config.hasOwnProperty('retry');

        this.addNextForPublish(newNode);
        this.addNode(newNode);
        return newNode;
    }

    private processNext(config: AlResponderWorkflowTask) {
        config.next?.forEach(next => {
            next.whenId = uuidv4();
            if (!Array.isArray(next.do) && next.do) {
                next.do = [next.do];
            }
        });
        return config;
    }

    // use just in load
    private associateMetaGraph(taskKey: string) {
        if (this.nodesDictionary[taskKey].model.config.next) {
            let node = this.nodesDictionary[taskKey];

            this.nodesDictionary[taskKey].model.config.next?.map(next => {
                if ((next.do?.length ?? 0) > 0) {
                    next.do?.forEach(item => {
                        let nextNode = this.nodesDictionary[item];
                        if (nextNode && node.successors && nextNode.predecessor) {
                            node.successors.push(item);
                            nextNode.predecessor.push(node.id);
                        }
                    });
                }
            });
        }
    }

    // use just in load
    private associateJoins(rootNode: string) {
        let node = this.nodesDictionary[rootNode];
        // asuming we can have a multi parent we need to know in what list to put the join
        const nodePredecessor: string[] = node.predecessor ?? [];
        if (nodePredecessor.length > 1) {
            // for each predecessor make the path up to root
            let previousConditions = nodePredecessor.map(predecessor => {
                return this.foundCommonParent(predecessor, []);
            });
            let commonKey = null;
            if (previousConditions?.length === 1) {
                commonKey = this.getNode(previousConditions[0][0]);
            } else {
                commonKey = this.foundCommonKey(previousConditions);
            }
            if (commonKey) {
                let previousNode = this.getNode(commonKey as string);

                // context
                // child1 child2
                // child2 do child1
                // child1 is a join
                // the position is context but child1 is a parallel of context
                const predeccesorUnique = [...new Set(node.predecessor)];
                if (!node.predecessor?.includes(commonKey as string) || predeccesorUnique.length === 1 || (node.conditions?.length ?? 0) > 0) {
                    previousNode.joins?.push(node.id);
                } else {
                    if (!previousNode.joinInto?.includes(node.id)) { // to avoid duplicates
                        previousNode.joinInto?.push(node.id);
                    }
                }
            }
        }
    }

    private createActionDictionary(actions: AlResponderAction[]): { [key: string]: AlResponderAction } {
        const actionDictionary: { [key: string]: AlResponderAction } = {};

        for (const action of actions) {
            if (action.action.ref){
                actionDictionary[action.action.ref] = action;
            }
        }
        // add dummy
        if (this.dummyAction.action.ref) {
            actionDictionary[this.dummyAction.action.ref] = this.dummyAction;
        }

        return actionDictionary;
    }

    private changeTaskInContainer(taskIdOldName: string, taskIdNewName: string) {
        const nodeContainerKey = this.getJoinContainer(taskIdOldName);

        if (nodeContainerKey) {
            const nodeJoins = this.nodesDictionary[nodeContainerKey].joins;
            if (nodeJoins) {
                const index = nodeJoins.findIndex(item => item === taskIdOldName);
                if (index >= 0) {
                    nodeJoins[index] = taskIdNewName;
                }
            }
        }
    }

    // return all his hierarchy, but if the hierarchy has join they are returned in other array
    private getNodeDown(nodeId: string, hierarchy: AlPlaybookActionTreeNode[], joinsInHierarchy: AlPlaybookActionTreeNode[]) {
        const node = this.nodesDictionary[nodeId];

        if (node.predecessor && node.predecessor.length > 1) {
            if (!joinsInHierarchy.includes(node)) {// to avoid repeated
                joinsInHierarchy.push(node);
            }
        } else {
            hierarchy.push(node);
            if (this.nodesDictionary[nodeId].model && this.nodesDictionary[nodeId].model.config.next) {
                this.nodesDictionary[nodeId].model.config.next?.forEach(condition => {
                    if (condition.do && condition.do.length > 0) {
                        condition.do.forEach(item => {
                            this.getNodeDown(item, hierarchy, joinsInHierarchy);
                        });
                    }
                });
            }
        }
    }

    private createTaskPaletteItemFromId(doId: string) {
        const vendor = this.getVendorFromNode(doId);
        let option: AlTaskPaletteItem = {
            name: doId,
            label: vendor,
            icon: this.getIcon(vendor),
            value: doId
        };
        return option;
    }

    private createTaskPaletteItemFromAction(action: AlResponderAction) {
        const vendor = this.getVendor(action.action);
        const displayName = action.action.tags?.find(tag => tag.name === "display_name") || '';
        let option: AlTaskPaletteItem = {
            name: displayName ? displayName.value : action.action.name,
            label: vendor,
            icon: this.getIcon(vendor),
            value: action
        };
        return option;
    }

    private getBrothers(nodeKey: string) {
        const node = this.getNode(nodeKey);
        let brothers: string[] = [];
        node.predecessor?.forEach(predecessor => {
            const nodePredecessor = this.getNode(predecessor);
            brothers = brothers.concat(nodePredecessor.successors ?? []);
        });
        return brothers;
    }
}
