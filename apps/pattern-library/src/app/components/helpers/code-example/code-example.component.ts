import { Component, Input, AfterContentInit, ElementRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AppResourcesService } from '../../../service/app-resources.service';

@Component({
  selector: 'code-example',
  templateUrl: './code-example.component.html',
  styleUrls: ['./code-example.component.scss']
})
export class CodeExampleComponent implements AfterContentInit {

    @Input() sourceId:string;
    @Input() rawCode:string;
    @Input() language:string = "markup";
    @Input() resourceId:string;

    public sanitizedCode?:SafeHtml;
    public hovering = false;

    constructor( public resources:AppResourcesService,
                 public sanitizer:DomSanitizer,
                 public element:ElementRef ) {
    }

    ngAfterContentInit() {
        if ( this.rawCode ) {
            this.sanitizedCode = this.sanitizer.bypassSecurityTrustHtml( this.escapeHtml( this.rawCode ) );
            return;
        }
        if ( this.resourceId ) {
            this.resources.getResource( this.resourceId )
                        .then   ( resource => {
                                    this.sanitizedCode = this.sanitizer.bypassSecurityTrustHtml( this.escapeHtml( resource  ) );
                                }, error => {
                                    console.warn(`Warning: couldn't retrieve resource with ID '${this.resourceId}'`, error );
                                } );
            return;
        }
        if ( this.sourceId ) {
            let element = document.getElementById( this.sourceId );
            if ( element ) {
                this.sanitizedCode = this.sanitizer.bypassSecurityTrustHtml( this.escapeHtml( element.innerHTML ) );
                this.rawCode = this.purgeHtml( element.innerHTML );
            }
        }
        let inputCode = this.element.nativeElement.querySelector("code" );
        if ( ! inputCode ) {
            inputCode = this.element.nativeElement.querySelector("pre" );
        }
        if ( ! inputCode ) {
            inputCode = this.element.nativeElement.querySelector("object");
        }
        if ( inputCode ) {
            this.sanitizedCode = this.sanitizer.bypassSecurityTrustHtml( this.escapeHtml( inputCode.innerHTML ) );
            this.rawCode = this.purgeHtml( inputCode.innerHTML );
            inputCode.style.display = "none";
        } else {
            console.log("No matching child element found!" );
            (window as any).te = this.element.nativeElement;
        }
    }

    hoverStart( $event:Event ) {
        this.hovering = true;
    }

    hoverEnd( $event:Event ) {
        this.hovering = false;
    }

    /**
     * Delicious, delicious hackery
     */
    copyToClipboard( $event:Event ) {
        const textElement = document.createElement('textarea');
        textElement.value = this.rawCode;
        document.body.appendChild(textElement);
        textElement.select();
        document.execCommand('copy');
        document.body.removeChild(textElement);
    }

    protected purgeHtml( raw:string ) {
        let converted = raw.replace( /\s+_ng[a-zA-Z0-9_\-]+="[a-zA-Z0-9_\-\s]*"/g, "" )
                            .replace( /\s+ng\-[a-zA-Z0-9_\-]+="[a-zA-Z0-9_\-\s]*"/g, "" )
                            .replace( /\s+([a-zA-Z\-_]+)=""/g, ' $1' );
        return converted;
    }

    protected escapeHtml( raw:string ) {
        const escapeMap:{[character:string]:string} = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;",
            "'": "&#x27;"
        };

        return this.purgeHtml( raw )
                    .replace( /[&<>"']/g, m => escapeMap.hasOwnProperty( m ) ? escapeMap[m] : m );
    }
}
