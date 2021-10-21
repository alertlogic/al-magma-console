import {
    AIMSUser,
    AlSession,
} from '@al/core';
import {
    AlHeraldSubscribersV2,
} from '@al/herald';
import { AlSelectItem } from '@al/ng-generic-components';
import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    OnChanges,
    SimpleChanges,
} from '@angular/core';
import { SelectItem } from 'primeng/api';
import { AlNotificationDictionariesUtility } from '../services/al-notification-dictionaries-utility';
import { AlIntegrationConnection, AlConnectorsClient } from '@al/connectors';

@Component({
    selector: 'al-notification-form',
    templateUrl: './al-notification-form.component.html',
    styleUrls: ['./al-notification-form.component.scss'],
})
export class AlNotificationFormComponent implements OnInit, OnChanges {

    @Input() public accountId:string = "";
    @Input() public loading:boolean = false;
    @Input() public showAttach: boolean = true;
    @Input() public editMode: boolean = false;
    @Input() public type: string = 'tableau';
    @Input() public emailSubject = '';
    @Input() public formDescription: string = "";
    @Input() public notifyBehaviorOptions: {label: string, value: string}[] = [];
    @Input() public whenSendNotificationsOptions: {label: string, value: number}[] = [];
    @Output() public onChanged = new EventEmitter<void>();

    public users: Array<AIMSUser> = [];
    public integrations: Array<AlIntegrationConnection> = [];
    public allSelectableUsers:Array<AlSelectItem> = [];
    public selectedUsers:AlSelectItem[] = [];
    // This will store the list of subscribers we are
    // loading initialy for the notification on edit
    public initialSelectedUsers: AlSelectItem[] = [];
    public initialSelectedIntegration?: AlIntegrationConnection;

    public allSelectableIntegrations:Array<SelectItem> = [];
    public selectedIntegration?: AlIntegrationConnection;

    public subscriptionType:string = "users";
    public subscriptionID:string = "";

    public subscribersMenu: Array<AlSelectItem<AlSelectItem>> = [];
    public selectedItemMenu!: AlSelectItem; // default selection.

    public dictionaries = new AlNotificationDictionariesUtility();

    public webhookPayloadFormat: unknown;

    public includeAttachments: boolean = false;
    public receiveEmpty: boolean = false;
    public notifyBehavior: string = "ifnotempty";

    public editUserCreator: string = '';
    public creatorDefaultLabel: string = '(creator)';

    public samples: any = null;
    public integrationTypesDictionary:{[id: string]: string} = {};

    ngOnInit() {
        this.webhookPayloadFormat = this.dictionaries.getWebhookPayload(this.type);

        this.reset();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.type && changes.type.currentValue === 'search_v2') {
            this.subscribersMenu.pop();
        }else if(changes.type && changes.type.currentValue !== 'search_v2' && this.subscribersMenu.length === 1){
            this.subscribersMenu.push(
                {
                    title: "Subscribe Integration",
                    subtitle: "(none)",
                    value: {
                        title: "Subscribe Integrations",
                        value: "integrations",
                    } as AlSelectItem,
                } as AlSelectItem
            );
        }
    }

    /**
     * Reset the component.
     */
    reset = () => {
        this.allSelectableUsers = [];
        this.selectedUsers = [];
        this.allSelectableIntegrations = [];
        this.subscriptionType = "users";
        this.subscriptionID = "";
        this.users = [];
        this.includeAttachments = false;
        this.receiveEmpty = false;
        this.editMode = false;
        this.notifyBehavior = "ifnotempty";
        this.integrations = [];
        this.setSubscribersMenu();
        this.selectedItemMenu = this.subscribersMenu[0].value; // default selection.
        this.initialSelectedUsers = [];
        delete this.selectedIntegration;
        delete this.initialSelectedIntegration;
        this.samples = null;
        this.changePlayload(null);
        this.setCreatorAsADefaultTarget();
        this.loadIntegrationTypes();
    }

    setSubscribersMenu(){
        this.subscribersMenu = [
            {
                title: "Subscribed User(s)",
                subtitle: "(none)",
                value: {
                    title: "Subscribe Users",
                    value: "users",
                } as AlSelectItem,
            } as AlSelectItem
        ];
        if(this.type !== 'search_v2'){
            this.subscribersMenu.push(
                {
                    title: "Subscribed Connector",
                    subtitle: "(none)",
                    value: {
                        title: "Subscribe Connector",
                        value: "integrations",
                    } as AlSelectItem,
                } as AlSelectItem
            );
        }
    }

    loadIntegrationTypes = async () => {

        // if the integration types is empty populate it
        if (Object.keys(this.integrationTypesDictionary).length === 0) {
            let integrationTypes = await AlConnectorsClient.getIntegrationTypes();

            integrationTypes.map( item => {
                this.integrationTypesDictionary[item.name] = item.display_name;
            });
        }
    }

    /**
     * Set´s the creator as a default target.
     */
    setCreatorAsADefaultTarget = () => {
        const usersList:Array<AIMSUser> = [];
        const currentUser:AIMSUser = AlSession.getUser();
        if (currentUser) {
            const subtitleText = `${currentUser.email} ${this.getUserLabel(currentUser.id as string)}`;
            const selectableUserItem = {
                title: currentUser.name,
                subtitle: subtitleText,
                value: currentUser,
            } as AlSelectItem;
            usersList.push(currentUser);
            this.selectedUsers.push(selectableUserItem);
        }
        this.selectedItemMenu = this.subscribersMenu[0].value;
        this.updateUsersSubtitle(usersList);
        this.subscriptionType = "users";
    }

    /**
     * Returns the appropiate user label depending
     * on editing mode, if user is creator
     * will receive the default label for creator.
     */
    getUserLabel = (userID:string):string => {
        if (this.editMode) {
            if (this.editUserCreator && this.editUserCreator === userID) {
                return this.creatorDefaultLabel;
            }
        } else {
            if (AlSession.getUser().id === userID) {
                return this.creatorDefaultLabel;
            }
        }
        return '';
    }

    /**
     * Set the subscribers populate the lists depending on subscriber type.
     */
    setSubscribers = (subscribers:AlHeraldSubscribersV2[]) => {
        this.selectedUsers = [];
        this.initialSelectedUsers = [];
        const usersList:Array<AIMSUser> = [];
        subscribers.forEach((subscriber:AlHeraldSubscribersV2) => {
            if (subscriber.subscriber_type === "user") {
                const user:AIMSUser = this.getUserById(subscriber.subscriber);
                usersList.push(user);
                const selectedUser = {
                    title: user.name,
                    value: user,
                    subtitle: `${user.email} ${this.getUserLabel(subscriber.subscriber)}`
                } as AlSelectItem;
                this.selectedUsers.push(selectedUser);
                // Here we store a copy of the initial notification subscribers
                this.initialSelectedUsers.push(selectedUser);
                this.selectedItemMenu = this.subscribersMenu[0].value;
                this.updateUsersSubtitle(usersList);
                this.subscriptionType = "users";
            } else if (subscriber.subscriber_type === "integration" || subscriber.subscriber_type === "connection") {
                const integration: AlIntegrationConnection = this.getIntegrationById(subscriber.subscriber);
                this.updateIntegrationsSubtitle(integration);
                this.selectedItemMenu = this.subscribersMenu[1].value;
                this.selectedIntegration = integration;
                // Here we store a copy of the initial notification subscribers
                this.initialSelectedIntegration = integration;
                this.subscriptionType = "integrations";
            }
        });
        if (usersList.length === 0) {
            this.updateUsersSubtitle([]);
        }
    }

    /**
     * Set users transforming the list of users into selectable items.
     */
    setSelectableUsers = (users:Array<AIMSUser>) => {
        this.allSelectableUsers = users.map((user:AIMSUser) => {
            const subtitleText = `${user.email} ${this.getUserLabel(user.id as string)}`;
            return {
                title: user.name,
                subtitle: subtitleText,
                value: {
                    title: user.name,
                    subtitle: subtitleText,
                    value: user,
                },
            } as AlSelectItem;
        });
    }

    getIntegrationTypeName(integrationType: string | undefined){
        if (integrationType && this.integrationTypesDictionary[integrationType]) {
            return "("+ this.integrationTypesDictionary[integrationType] + " Connector)";
        }
        return '';
    }

    /**
     * Set integrations transforming the list of integrations into selectable integrations.
     */
    setSelectableIntegrations = (integrations: AlIntegrationConnection[]) => {
        if (integrations) {
            this.integrations = integrations;
            this.allSelectableIntegrations = integrations.map(
                (integration) => {

                    let integrationType = this.getIntegrationTypeName(integration.type);

                    return {
                        label: `${integration.name} ${integrationType}`,
                        value: integration,
                    } as SelectItem;
            });
        }
    }

    /**
     * Get all the subscribers
     */
    getSubscribers = ():AlHeraldSubscribersV2[] => {
        const subscribers:AlHeraldSubscribersV2[] = this.selectedUsers.map((selectedUser:AlSelectItem) => {
            return {
                subscriber: selectedUser.value["id"],
                subscriber_type: "user",
            } as AlHeraldSubscribersV2;
        });

        if (this.selectedIntegration) {
            let subscriber = {
                subscriber: this.selectedIntegration.id,
                subscriber_type: "connection",
            } as AlHeraldSubscribersV2;

            subscribers.push(subscriber);
        }

        return subscribers;
    }

    /**
     * Get all the subscribers we have edited, they will be marked as add or delete
     */
    getEditedSubscribers = (): AlHeraldSubscribersV2[] => {
        // Let's get the subscribers ids from the selected and the initial
        // selected in order to use them to verify if they were added or deleted
        let selectedUsersIds: (string|undefined)[] = this.selectedUsers.map(item => item.value.id);
        let initialSelectedUsersIds: (string|undefined)[] = this.initialSelectedUsers.map(item => item.value.id);
        // Now with the previous ids lets filter both arrays to get the final version of the list of subscribers
        let editedSubscribers = [ ...this.selectedUsers.filter((selectedUser: AlSelectItem) => !initialSelectedUsersIds.includes(selectedUser.value.id)), // added users
                                  ...this.initialSelectedUsers.filter((selectedUser: AlSelectItem) => !selectedUsersIds.includes(selectedUser.value.id)) ]; // removed users

        // Lets clean up the edited users in case we remove some by mistake and add it back
        editedSubscribers = editedSubscribers.filter((subscriber, index, editedSubscribersArray) => {
            return editedSubscribersArray.find((s, i) => s.value.id === subscriber.value.id && index !== i) === undefined;
        });

        // Lets create the subscribers object based in the previous filtering
        let subscribers = editedSubscribers.map((selectedUser:AlSelectItem) => {
            return {
                subscriber: selectedUser.value.id,
                subscriber_type: "user",
                action: (selectedUser.checked === false)? 'delete' : 'add'
            } as AlHeraldSubscribersV2;
        });

        // If the new selected integration is different from the initialy loaded
        // means the integration is being updated then we need to loop over them
        // and push each subscriber new one as added and old one as deleted
        if (this.selectedIntegration && this.initialSelectedIntegration) { // integration was change
            if (this.selectedIntegration.id !== this.initialSelectedIntegration.id) {
                [this.selectedIntegration, this.initialSelectedIntegration].forEach((integration: AlIntegrationConnection, index: number) => {

                    let subscriber = {
                        subscriber: integration.id,
                        subscriber_type: "connection",
                        action: (index === 0)? 'add' : 'delete'
                    } as AlHeraldSubscribersV2;

                    subscribers.push(subscriber);
                });
            }
        } else {
            // integratoin was added
            let integration: AlIntegrationConnection|undefined = this.selectedIntegration;
            let action: string = 'add';
            // integration was removed
            if (this.initialSelectedIntegration) {
                integration = this.initialSelectedIntegration;
                action = 'delete';
            }
            if (integration) {
                let subscriber = {
                    subscriber: integration.id,
                    subscriber_type: "connection",
                    action: action
                } as AlHeraldSubscribersV2;

                subscribers.push(subscriber);
            }
        }

        return subscribers;
    }

    /**
     * Returns the email subject.
     */
    getEmailSubject = ():string => {
        return this.emailSubject;
    }

    /**
     * Returns the include_attachments value
     */
    allowAttachments = () : boolean => {
        return this.includeAttachments;
    }

    /**
     * Returns the notify_behavior value
     */
    getNotifyBehavior = () : string => {
        return this.notifyBehavior;
    }

    /**
     * Set the include_attachments param.
     */
    setIncludeAttachments = (includeAttachments:boolean) => {
        this.includeAttachments = includeAttachments;
    }

    /**
     * Set the notify_behavior param.
     */
    setNotifyBehavior = (notifyBehavior: string) => {
        this.notifyBehavior = notifyBehavior;
        if(this.notifyBehavior === 'always'){
            this.receiveEmpty = true;
        }else{
            this.receiveEmpty = false;
        }
    }

    /**
     * Set the email subject.
     */
    setEmailSubject = (emailSubject:string | undefined) => {
        if (emailSubject) {
            this.emailSubject = emailSubject;
        }
    }

    /**
     * Get the integration from the current options.
     */
    getIntegrationById = (integrationId:string):  AlIntegrationConnection => {
        return this.integrations.find(
                (integration: AlIntegrationConnection) => integration.id === integrationId)
            ||  { id: integrationId, name: `Connector (${integrationId})` } as AlIntegrationConnection;
    }

    /**
     * Get the user from the current options.
     */
    getUserById = (userId:string): AIMSUser => {
        return this.users.find((user:AIMSUser) => user.id === userId)
            ||  { id: userId, name: `User (${userId})` } as AIMSUser;
    }

    /**
     * Validate the subscribers section.
     */
    hasSubscribersSelected = (): boolean => {
        return !(this.selectedUsers.length <= 0 && (!this.selectedIntegration));
    }

    /**
     * Validate if the user has not deleted the email subject.
     */
    hasEmailSubject = (): boolean => {
        return (this.emailSubject) ? true: false;
    }

    /**
     * Updates the users subtitle.
     */
    updateUsersSubtitle = (users:AIMSUser[]) => {
        if (users && this.subscribersMenu[0]) {
            this.subscribersMenu[0].subtitle = (users.length === 0) ? "(none)" : "(" + users.length + ")";
        }
    }

    /**
     * Updates the integrations subtitle.
     */
    updateIntegrationsSubtitle = (integration: AlIntegrationConnection) => {
        if (this.subscribersMenu[1]) {
            this.subscribersMenu[1].subtitle = (integration) ? "(1)" : "(none)";
        }
    }

    /**
     * Event handler when user select/deselect an integration.
     */
    onSelectedIntegration = (event: AlIntegrationConnection) => {
        this.changePlayload(event);
        this.updateIntegrationsSubtitle(event);
        this.onChanged.emit();
    }

    /**
     * When the user select different recipient type.
     */
    onSelectSubcriptionType = (event:AlSelectItem) => {
        this.subscriptionType = event.value;
        this.onChanged.emit();
    }

    /**
     * Event handler when user select/deselect users recipients.
     */
    onSelectedUser = (event:AIMSUser[]) => {
        this.updateUsersSubtitle(event);
        this.onChanged.emit();
    }

    /**
     * Event handler when selected receive empty results
     */
    onNotifyBehaviorChanged = (checked:boolean) => {
        if(this.receiveEmpty){
            this.notifyBehavior = 'always';
        }else{
            this.notifyBehavior = 'ifnotempty';
        }
        this.onChanged.emit();
    }

    changePlayload(integration: AlIntegrationConnection | null): void {
        this.samples = null;

        this.webhookPayloadFormat = null;
        if (integration && 'sample_payload' in integration && integration.sample_payload) {
            this.samples = integration.sample_payload.map((s: any) => {
                let sample = Object.assign({}, s);
                sample.type = typeof sample.content === 'object' ? 'json' : 'other';
                return sample;
            });
        }
    }

}
