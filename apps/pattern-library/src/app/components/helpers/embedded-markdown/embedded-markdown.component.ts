import { Component, Input, AfterContentInit, ElementRef } from '@angular/core';
import { AppResourcesService } from '../../../service/app-resources.service';

@Component({
  selector: 'embedded-markdown',
  templateUrl: './embedded-markdown.component.html',
  styleUrls: ['./embedded-markdown.component.scss']
})
export class EmbeddedMarkdownComponent implements AfterContentInit {

    @Input() resourceId:string;

    public markdown:string;

    constructor( public resources:AppResourcesService,
                 public element:ElementRef ) {
    }

    ngAfterContentInit() {
        if ( this.resourceId ) {
            this.resources.getResource( this.resourceId )
                        .then   ( resource => {
                                    this.markdown = resource;
                                }, error => {
                                    console.warn(`Warning: couldn't retrieve resource with ID '${this.resourceId}'`, error );
                                } );
            return;
        }
    }

    onReady() {
    }
}
