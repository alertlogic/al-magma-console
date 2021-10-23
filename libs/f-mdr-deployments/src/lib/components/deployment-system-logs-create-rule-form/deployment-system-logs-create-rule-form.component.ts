
import { Component, OnInit, Output, EventEmitter, Input, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, FormArray, Validators } from '@angular/forms';

import { AlBottomSheetHeaderOptions, AlBottomSheetComponent, AlNotification } from '@al/ng-generic-components';
import { SubscriptionLike } from 'rxjs';
import { AlApplicationsClient, AlDeployACollectorPayload, AlRulePayload } from '@al/applications';
import { StreamsService, StreamsDescriptor } from '@components/technical-debt';

@Component({
    selector: 'al-deployment-system-logs-create-rule-form',
    templateUrl: './deployment-system-logs-create-rule-form.component.html',
    styleUrls: ['./deployment-system-logs-create-rule-form.component.scss']
})
export class DeploymentSystemLogsCreateRuleFormComponent implements OnInit, OnDestroy, AfterViewInit {
    @Input() public accountId: string;
    @Input() public typeRule: string;
    @Input() public action: string;
    @Input() public ruleId: string;
    @Input() public isDefaultRule: boolean;
    @Input() public deploymentId: string;
    @Input() public headerOptions: AlBottomSheetHeaderOptions;
    @Input() public rulePayload: AlRulePayload;

    @Output() public saveModal: EventEmitter<boolean> = new EventEmitter();
    @Output() public closeModal: EventEmitter<boolean> = new EventEmitter();

    @ViewChild("alBottomSheet", { static: true }) public alBottomSheet: AlBottomSheetComponent;

    /** Notifications **/
    public formNotifications = new EventEmitter<AlNotification>();
    static AUTO_DISMISS_ERROR: number = 8000;

    /** Subscriptions */
    private statusChangesSubscription: SubscriptionLike;

    public isLoading: boolean = true;
    public formGroup: FormGroup;

    public streams: StreamsDescriptor[] = [];
    public streamsSelected: {name: string, enabled: boolean}[] = [];
    public totalChildren: number = 0;
    public totalStreams: number = 0;
    public collectAll: boolean;
    public checkingAll: boolean;

    constructor(protected formBuilder: FormBuilder,
                protected _StreamsService: StreamsService) {}

    ngAfterViewInit(): void {
        this.open();
    }

    ngOnDestroy(): void {
        if (this.statusChangesSubscription) {
            this.statusChangesSubscription.unsubscribe();
        }
    }

    ngOnInit(): void {
        this.setFormValidations();
    }

    private open() {
        this.alBottomSheet.open();
    }

    private async setFormValidations() {
        const group: any = {};
        group['app_name'] = new FormControl('', Validators.required);
        group['enabled'] = new FormControl(true);

        if (this.action !== 'create') {
            const appName = this.action === 'duplicate' ? 'Copy of ' + this.rulePayload.name : this.rulePayload.name
            group['app_name'].setValue(appName);
            group['enabled'].setValue(this.rulePayload.enabled);
        }

        if (this.typeRule === 'syslog') {
            group['agent_port'] = new FormControl('', Validators.required);
            group['disk_limit'] = new FormControl('', Validators.required);
            group['container_logs_enabled'] = new FormControl(true);

            if(this.action !== 'create') {
                group['agent_port'].setValue(this.rulePayload.config.syslog.agent_port);
                group['disk_limit'].setValue(this.rulePayload.config.syslog.disk_limit);
                group['container_logs_enabled'].setValue(this.rulePayload.config.syslog.container_logs_enabled);
                console.log("container_logs_enabled: ", this.rulePayload.config.syslog.container_logs_enabled);
            }
        } else {
            this.collectAll = this.action !== 'create' ? this.rulePayload.config.eventlog.collect_from_discovered_streams : false;
            await this.loadStreamsCollection();
        }

        this.formGroup = this.formBuilder.group(group);

        this.statusChangesSubscription = this.formGroup.statusChanges.subscribe(
            status => {
                this.headerOptions.primaryAction.disabled = !(status === 'VALID');
            }
        );

        this.formGroup.updateValueAndValidity();

        this.isLoading = false;
    }

    async loadStreamsCollection() {
        return this._StreamsService.get(this.accountId).toPromise().then(response => {
            this.streams = Object.keys(response.streams).map(key => {
                if(response.streams[key].children.length > 0) {
                    this.totalChildren += response.streams[key].children.length;
                }
                return response.streams[key];
            });
            this.totalStreams = this.streams.length + this.totalChildren;
            if (this.action !== 'create'){
                if(this.rulePayload.config.eventlog.collect_from_discovered_streams) {
                    this.onCheckAll(true);
                } else {
                    this.setSelectedStreams(this.rulePayload.config.eventlog.streams);
                }
            }
        }, error => {
            this.handleError('loadStreamsCollection', error);
        });
    }

    setSelectedStreams(streamsSaved: string[]){
        // Loop the policy's streams
        streamsSaved.forEach(element =>  {
            // Loop the streams list
            this.streams.some( stream => {
                if (element === stream['stream_id'] ) {
                    stream['selected'] = true;
                    this.streamsSelected[element] = {name: element, enabled: true};
                    return true;
                } else {
                    if (stream['children'].length > 0) {
                        // Loop the stream's child list
                        stream['children'].some( streamChild => {
                            if (element === streamChild['stream_id']) {
                                streamChild['selected'] = true;
                                stream['showChildren'] = true;
                                this.streamsSelected[element] = {name: element, enabled: true};
                                return true;
                            }
                        });
                    }
                }
            });
        });
    }

    public saveOrUpdate(payload: AlRulePayload) {
        if (this.action === 'edit') {
            AlApplicationsClient.updateRule(this.accountId, this.ruleId, payload).then(
                () => {
                    this.alBottomSheet.hide();
                    this.saveModal.emit(true);
                    this.isLoading = false;
                },
                error => this.handleError(this.action, error )
            );
        } else if (this.action === 'create' || this.action === 'duplicate') {
            if(this.action === 'create') {
                payload.scope = [];
            }

            AlApplicationsClient.addRule(this.accountId, payload, this.deploymentId).then(
                () => {
                    this.alBottomSheet.hide();
                    this.saveModal.emit(true);
                    this.isLoading = false;
                },
                error => this.handleError(this.action, error )
            );
        }
    }

    showHideAll(item: StreamsDescriptor, event: boolean){
        item.showChildren = event;
        if(item.showChildren === false){
            item.icon = 'add_circle';
        } else{
            item.icon = 'remove_circle';
        }
    }

    onCheckAll(event: boolean) {
        this.checkingAll = true;
        this.streams.forEach(stream => {
            stream.selected = event;
            this.onCheckBox(stream, event);
            this.showHideAll(stream, event);

            if(stream.hasOwnProperty('children') && stream.children.length > 0){
                stream.children.forEach(child => {
                    child.selected = event;
                    this.onCheckBox(child, event, stream);
                });
            }
        });
        this.checkingAll = false;
    }

    onCheckBox(item: StreamsDescriptor, $event: boolean, parentItem?: StreamsDescriptor) {
        if(item.hasOwnProperty('children') && item.children.length > 0){
            if (item.selected === true) {
                this.streamsSelected[item.stream_id] = {name: item.stream_id, enabled: true};
            } else{
                delete this.streamsSelected[item.stream_id];
            }
            for (let subitem of item.children){
                subitem.selected = item.selected;
                if (subitem.selected === true) {
                    this.streamsSelected[subitem.stream_id] = {name: subitem.stream_id, enabled: true};
                } else{
                    delete this.streamsSelected[subitem.stream_id];
                }
            }
            item.showChildren = true;
        } else{
            if (item.selected === true) {
                this.streamsSelected[item.stream_id] = {name: item.stream_id, enabled: true};
                if(parentItem && parentItem.children.filter(v => !v.selected).length === 0){
                    parentItem.selected = true;
                    this.streamsSelected[parentItem.stream_id] = {name: parentItem.stream_id, enabled: true};
                }
            } else{
                delete this.streamsSelected[item.stream_id];
            }
        }
        if($event === false){
            if(parentItem){
                if(parentItem.hasOwnProperty('selected')){
                    if(parentItem.selected === true){
                        parentItem.selected = false;
                        delete this.streamsSelected[parentItem.stream_id];
                    }
                }
            }
        }

        this.collectAll = (this.totalStreams === Object.keys(this.streamsSelected).length) ? true: false;
    }

    onShowHide(item: StreamsDescriptor){
        item.showChildren = !item.showChildren;
        if(item.showChildren === false){
            item.icon = 'add_circle';
        } else{
            item.icon = 'remove_circle';
        }
    }

    public onSubmitForm() {
        this.rulePayload.name = this.formGroup.controls['app_name'].value;
        this.rulePayload.enabled = this.formGroup.controls['enabled'].value;
        this.rulePayload.deployment_id = this.deploymentId;
        if(this.typeRule === 'syslog') {
            this.rulePayload.config = {
                syslog: {
                    agent_port: this.formGroup.controls['agent_port'].value,
                    disk_limit: this.formGroup.controls['disk_limit'].value,
                    container_logs_enabled: this.formGroup.controls['container_logs_enabled'].value,
                }
            }
            this.formGroup.getRawValue();
        } else {
            let eventLogStreams: string[] = [];
            if(!this.collectAll) {
                Object.keys(this.streamsSelected).forEach(element => {
                    eventLogStreams.push(element);
                })
            }
            if(eventLogStreams){
                this.rulePayload.config = {
                    eventlog: {
                        collect_from_discovered_streams: this.collectAll,
                        streams: eventLogStreams
                    }
                }
            }
        }

        this.saveOrUpdate(this.rulePayload);
    }

    public onCancelForm() {
        this.alBottomSheet.hide();
        this.closeModal.emit(true);
    }

    private handleError(typeError: string, error: any) {
        let message: string = "";
        let reason_text = null;
        if (error && error.data && error.data.errorinfo && error.data.errorinfo.description) {
            reason_text = error.data.errorinfo.description;
        }

        switch (typeError) {
            case 'create':
                message = message ? message : "There was an issue creating the Rule. Please try again later. If this error continues, contact Alert Logic Support.";
                break;
            case 'edit':
                message = message ? message : "There was an issue editing the Rule. Please try again later. If this error continues, contact Alert Logic Support.";
                break;
            case 'duplicate':
                message = message ? message : "There was an issue duplicating the Rule. Please try again later. If this error continues, contact Alert Logic Support.";
                break;
            case 'loadStreamsCollection':
                message = message ? message : "Internal error getting the streams collection.";
                break;
        }
        if (error.status !== 500 && reason_text) {
            message = reason_text;
        }

        this.formNotifications.emit(AlNotification.error(message, DeploymentSystemLogsCreateRuleFormComponent.AUTO_DISMISS_ERROR, true));
        this.isLoading = false;
    }
}
