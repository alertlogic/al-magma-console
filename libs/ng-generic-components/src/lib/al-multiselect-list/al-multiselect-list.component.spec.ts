/**
 * Test suite for AlMultiSelectListComponent
 *
 * @author Gisler Garces <ggarces@alertlogic.com>
 * @copyright 2019 Alert Logic, Inc.
 */
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {AlMultiSelectListComponent} from './al-multiselect-list.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

// Required primeng dependencies
import {TooltipModule} from 'primeng/tooltip';
import {ChipsModule} from 'primeng/chips';
import {MultiSelectModule} from 'primeng/multiselect';
import { AlSelectItem } from '../types';

interface MockValue {
    details?: string;
    checked?: boolean;
    title?: string;
    subtitle?: string;
    value?: AlSelectItem<MockValue>;
    id?: string;
}

describe("AlMultiSelectListComponent", () => {
    let component: AlMultiSelectListComponent<MockValue>;
    let fixture: ComponentFixture<AlMultiSelectListComponent<MockValue>>;
    let optionsMock: AlSelectItem<MockValue>[] = [];

    beforeEach(() => {
        optionsMock = [
            {
                title: "Peter Piper",
                subtitle: "",
                value: {
                    title: "Peter Piper",
                    subtitle: "(creator)",
                    details: "Peter@piper.com",
                    checked: false
                },
            },
            {
                title: "Billy Hoffman",
                subtitle: "",
                value: {
                    title: "Billy Hoffman",
                    checked: false,
                    id: '1'
                }
            },
            {
                title: "Brian Pearson",
                subtitle: "",
                value: {
                    title: "Brian Pearson",
                    checked: false
                }
            },
            {
                title: "Peter Griffin",
                subtitle: "",
                value: {
                    title: "Peter Griffin",
                    checked: false,
                    id: '2'
                }
            },
            {
                title: "Keanu Reeves",
                subtitle: "",
                value: {
                    title: "Keanu Reeves",
                    subtitle: "(Neo)",
                    details: "kreeves@holywood.com",
                    checked: false
                },
            },
        ];
        TestBed.configureTestingModule({
            declarations: [AlMultiSelectListComponent],
            imports: [
                TooltipModule,
                ChipsModule,
                MultiSelectModule
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent<AlMultiSelectListComponent<MockValue>>(AlMultiSelectListComponent);
        component = fixture.componentInstance;
    });

    describe("When the component is initiated", () => {
        beforeEach(() => {
            component.options = optionsMock;
        });
        it("should set Choose as the default value for the label", () => {
            expect(component.placeholder).toBe('Choose');
        });
    });
});
