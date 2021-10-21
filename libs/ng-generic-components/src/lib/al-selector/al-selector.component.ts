/**
 * @author Stephen Jones <stephen.jones@alertlogic.com>
 * @copyright Alert Logic, Inc 2020
 */
import { Input, Output, Component, OnInit, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { AlSelectorItem } from './al-selector.types';

@Component({
    selector: 'al-selector',
    templateUrl: './al-selector.component.html',
    styleUrls: ['./al-selector.component.scss']
})

/*
 *
 */
export class AlSelectorComponent implements OnInit {

    @Input() title: string = '';
    @Input() selectors: AlSelectorItem[] = [];
    @Output() selected: EventEmitter<string> = new EventEmitter<string>();
    @ViewChild('container', { static: true }) container: ElementRef;

    private selectorCount: number = 0;

    ngOnInit() {
        this.selectorCount = this.globalSelectorCount();
    }

    /*
    * Radios need a shared name to make the selection mutually exclusive.
    * Generate a name based of the count of al-selectors
    */
    public uniqueName = (): string => {
        return `radioALSelector-${this.selectorCount}`;
    }

    /*
     * Each radio needs a unique id so that clickin the label
     * selects the radio
    */
    public uniqueID = (index: number): string => {
        return `radioALSelector-${this.selectorCount}-${index}`;
    }

    /*
     * Radio button selection handler
     */
    public handleChange = (e: Event): void => {
        const target = e.target as HTMLInputElement;
        this.selected.emit(target.value);
    }

    /*
     * Deselect the selection
     */
    public clear = (): void => {
        const el: HTMLDivElement = this.container.nativeElement;
        const selectedRadio: HTMLInputElement | null = el.querySelector('input:checked');

        if (selectedRadio) {
            selectedRadio.checked = false;
        }
    }

    /*
     * Gets a count of al-selectors on the page to facilitate generating
     * a unique input name
     */
    private globalSelectorCount = (): number => {
        return document.getElementsByTagName('al-selector').length;
    }

}
