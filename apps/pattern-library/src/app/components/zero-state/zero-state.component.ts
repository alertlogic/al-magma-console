import { AxiosResponse } from 'axios';
import { APIRequestParams } from '@al/core';
import { Component, OnInit } from '@angular/core';
import { AlToastService, AlToastMessage } from '@al/ng-generic-components';

@Component({
  selector: 'app-zero-state',
  templateUrl: './zero-state.component.html',
  styleUrls: ['./zero-state.component.scss']
})
export class ZeroStateComponent implements OnInit {

    public viewError:string|Error|AxiosResponse;

    constructor( public toaster:AlToastService ) {
    }

    ngOnInit() {
        this.toaster.getShowEmitter('zero');
        this.toaster.getCloseEmitter('zero');
        this.toaster.getButtonEmitter('zero').subscribe(
          (button:any) => {
            this.toaster.clearMessages('zero');
          }
        );
        this.resetViewError();
    }

    public buttonClick( $event:Event ) {
        const message:AlToastMessage = {
          sticky: true,
          closable: true,
          data: {
            title: 'You want some bacon with this toast?',
          }
        };
        this.toaster.showMessage('zero', message );
    }

    public resetViewError() {
        this.viewError = null;
        setTimeout( () => {
            const mockConfig:APIRequestParams = {
                service_stack: 'insight:api',
                service_name: 'herald',
                version: 'v2',
                path: '/made/up/path',
                params: {
                    pudding: "figgy"
                },
                data: {
                    message: "Give us some figgy pudding."
                },
                method: "POST"
            };
            const mockResponse:AxiosResponse = {
                config: mockConfig,
                status: 504,
                statusText: "Request Timed Out",
                data: null,
                headers: {
                    'X-Error-Code': 'Death from above'
                }
            };
            this.viewError = mockResponse;
        }, 2500 );
    }
}
