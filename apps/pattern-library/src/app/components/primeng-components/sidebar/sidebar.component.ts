import { Component, ViewChild } from '@angular/core';
import { AlSidebarComponent, AlSidebarConfig } from '@al/ng-generic-components';
import { AlExposureConcludeComponent, AlExposureDisposeComponent } from '@al/ng-asset-components';

@Component({
    templateUrl: './sidebar.component.html',
    styles: [`
        :host ::ng-deep button {
            margin-right: .25em;
        }
    `]
})
export class SidebarComponent {
    @ViewChild(AlSidebarComponent) public rightDrawer: AlSidebarComponent;
    @ViewChild("concludeExposure") concludeExposure: AlExposureConcludeComponent;
    @ViewChild("disposeExposure") disposeExposure: AlExposureDisposeComponent;

    public itemIds: string[] = [];
    public deploymentIds: string[] = [];
    public filter: string[] = [];

    public config: AlSidebarConfig = {
        expand: false,
        expandable: true,
        inline: false,
        header: {
            title: "Sidebar Test",
            icon: {
                name: 'check'
            },
            showClose: true,
            disableClose: false
        },
        isloading: true,
        loadingCaption: 'Loading..',
        enableButtonToolbar: true,
        viewHelper: true,
        primary: {
            text: 'Primary',
            disabled: false,
            icon: {
                name: 'check'
            }
        },
        secondary: {
            text: 'Secondary',
            disabled: false,
            icon: {
                name: 'check'
            },
            callback: this.secondaryCB
        },
        ternary: {
            text: 'Ternary',
            disabled: true,
            icon: {
                name: 'check'
            },
            callback: this.ternaryCB
        }
    };

    public configB: AlSidebarConfig = {
        expand: true,
        expandable: false,
        inline: false,
        header: {
            title: "Sidebar (Fully Expanded)",
            icon: {
                name: 'check'
            },
            showClose: true,
            disableClose: false
        },
        isloading: true,
        loadingCaption: 'Loading..',
        enableButtonToolbar: true,
        viewHelper: true,
        primary: {
            text: 'Primary',
            disabled: false,
            icon: {
                name: 'check'
            }
        },
        secondary: {
            text: 'Secondary',
            disabled: false,
            icon: {
                name: 'check'
            },
            callback: this.secondaryCB
        },
        ternary: {
            text: 'Ternary',
            disabled: true,
            icon: {
                name: 'check'
            },
            callback: this.ternaryCB
        }
    };

    public showSideBar:boolean = false;
    public showSideBarB = false;
    public accountId:string = '10000';

    constructor() { }

    secondaryCB() {
        console.log('This is secondaryCB action from calling component');
    }

    ternaryCB() {
        console.log('This is ternaryCB action from calling component');
    }

    notification() {
        this.rightDrawer.notifyInfo("Info noticat", 5000, true);
        this.rightDrawer.notifyError("Error", 5000, false);
        this.rightDrawer.notifySuccess("Success", 5000, false);
    }

    openExposureDispose(){
        this.disposeExposure.rightDrawer.open();
    }

    openExposureConclude() {
        this.concludeExposure.rightDrawer.open();
    }

    onConcludeSuccess(){
        console.log('Conclude action success');
    }

    onConcludeFailure() {
        console.log('Conclude action failed');
    }

    onDisposeSuccess(){
        console.log('Dispose action success');
    }

    onDisposeFailure() {
        console.log('Dispose action failed');
    }

    onClosed() {
        console.log('On close called');
    }

    onSaved() {
        console.log('On saved call');
    }
}
