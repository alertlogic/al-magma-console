import { AlSegment } from './al-json-viewer.types';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';


@Component({
    selector: 'al-json-viewer',
    templateUrl: './al-json-viewer.component.html',
    styleUrls: ['./al-json-viewer.component.scss']
})
export class AlJsonViewerComponent implements OnInit {

    @Input() set json(json: any) {
        this.segments = this.getSegments(json);
    }
    @Input() expanded: boolean = false;
    @Input() isLeafSelectable: boolean = false;
    @Input() initialKeypath?: string; // In case we have a previous keypath from the parent component

    @Output() onLeafClick: EventEmitter<{ keypath: string, value: unknown }> = new EventEmitter();

    public segments: AlSegment[] = [];
    public parentSegment?: AlSegment;

    ngOnInit() {
        if (this.expanded) {
            this.toggleJSONSegments();
        }
    }

    getSegments(json: any): AlSegment[] {
        let segments: AlSegment[] = [];
        if (typeof json === 'object') {
            Object.keys(json).forEach(key => {
                segments.push(this.parseKeyValue(key, json[key]));
            });
        }
        // Let's set the parent segment back to its initial state
        this.parentSegment = undefined;

        return segments;
    }

    isExpandable(segment: AlSegment) {
        return segment.type === 'object' || segment.type === 'array';
    }

    toggle(segment: AlSegment, event: MouseEvent) {
        if (this.isExpandable(segment)) {
            segment.expanded = !segment.expanded;
            if (event.ctrlKey || event.metaKey) {
                segment.openChildren = segment.expanded;
            }
            this.setSegmentChildren(segment);
        } else if (this.isLeafSelectable) {
            const initialKeypath: string = this.initialKeypath? `${this.initialKeypath}.`: '';
            this.onLeafClick.emit({ keypath: `${initialKeypath}${segment.keypath}`, value: segment.value });
        }
    }

    setSegmentChildren(segment: AlSegment) {
        // Let's set the parent segment to help build the keypath
        this.parentSegment = segment;
        segment.children = this.getSegments(segment.value);
    }

    toggleJSONSegments(segments: AlSegment[] = this.segments): void {
        segments.forEach( (segment: AlSegment) => {
            segment.expanded = this.expanded;
            if (segment.expanded && this.isExpandable(segment)) {
                this.setSegmentChildren(segment);
                this.toggleJSONSegments(segment.children);
            }
        });
    }

    public handleJSONState(state: boolean) {
        this.expanded = state;
        this.toggleJSONSegments();
    }

    private parseKeyValue(key: string, value: any): AlSegment {
        const segment: AlSegment = {
            key: key,
            value: value,
            type: '',
            description: '' + value,
            expanded: this.expanded,
            keypath: key
        };

        switch (typeof segment.value) {
            case 'number': {
                segment.type = 'number';
                break;
            }
            case 'boolean': {
                segment.type = 'boolean';
                break;
            }
            case 'function': {
                segment.type = 'function';
                break;
            }
            case 'string': {
                segment.type = 'string';
                segment.description = '"' + segment.value + '"';
                break;
            }
            case 'undefined': {
                segment.type = 'undefined';
                segment.description = 'undefined';
                break;
            }
            case 'object': {
                // yea, null is object
                if (segment.value === null) {
                    segment.type = 'null';
                    segment.description = 'null';
                } else if (Array.isArray(segment.value)) {
                    segment.type = 'array';
                    segment.description = 'Array[' + segment.value.length + '] ';
                } else if (segment.value instanceof Date) {
                    segment.type = 'date';
                } else {
                    segment.type = 'object';
                    segment.description = 'Object ' + '{ ... }';
                }
                break;
            }
        }
        // Let's set the keypath in order to use it to get full path to value reference
        if (this.parentSegment) {
            const parentKey: string = this.parentSegment.keypath || this.parentSegment.key;
            segment.keypath = (this.parentSegment.type === 'array')? `${parentKey}[${key}]` : `${parentKey}.${key}`;
        }

        return segment;
    }
}
