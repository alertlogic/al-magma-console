import { Component, OnInit, ViewChild } from '@angular/core';
import { AlNavigationService } from '@al/ng-navigation-components';
import { AlViewHelperComponent } from '@al/ng-generic-components';
import { AlIrisClient } from '@al/iris';

@Component({
  selector: 'markdown-previewer',
  templateUrl: './markdown-previewer.component.html',
  styleUrls: ['./markdown-previewer.component.scss']
})
export class MarkdownPreviewerComponent implements OnInit
{
    @ViewChild(AlViewHelperComponent, {static:false}) viewHelper!:AlViewHelperComponent;
    public markdownText:string = "";
    public email:string = "";

    constructor( public navigation:AlNavigationService ) {
    }

    ngOnInit() {
    }

    public async sendEmailNotification() {
        try {
            let renderedMarkdown = await AlIrisClient.renderMarkdown(this.markdownText);
            console.log("Sending Email...");
            this.downloadFile(renderedMarkdown.rendered_markdown, 'text/html');
            this.viewHelper.notifySuccess("The notification email has been sent to: " + this.email, 5000);
        } catch( e ) {
            console.log("Raw error...", e );
            this.viewHelper.setError( e );
        }
    }

    downloadFile(data: any, type: string) {
        const blob = new Blob([data], { type: type });
        const url= window.URL.createObjectURL(blob);
        window.open(url);
    }

}
