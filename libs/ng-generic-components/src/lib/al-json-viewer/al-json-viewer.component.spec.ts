import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AlJsonViewerComponent } from './al-json-viewer.component';

const testSegment = {
    key: "",
    value: "",
    type: "",
    description: "",
    expanded: false
};

const mockStringSegment = {
    key: "my_string",
    value: "My awesome string",
    type: "string",
    expanded: false,
    description: `"My awesome string"`,
    keypath: 'my_string'
};

const mockArraySegment = {
    key: "my_array",
    value: [
        "item 1",
        "item 2",
        "item 3"
    ],
    type: "array",
    expanded: false,
    description: "Array[3] ",
    keypath: 'my_array',
    children: [
        { key: '0', value: 'item 1', type: 'string', description: '"item 1"', expanded: false, keypath: 'my_array[0]' },
        { key: '1', value: 'item 2', type: 'string', description: '"item 2"', expanded: false, keypath: 'my_array[1]' },
        { key: '2', value: 'item 3', type: 'string', description: '"item 3"', expanded: false, keypath: 'my_array[2]' }
    ]
};

const json = {
    my_string: "My awesome string",
    m_number: 123,
    my_boolean: false,
    my_array: [
        "item 1",
        "item 2",
        "item 3"
    ],
    my_object: {
        another_number: 456,
        another_array: [
            {
                key: "value",
            },
            {
                key: true
            }]
    },
    my_function: function () { return 1; },
    my_object_undefined: undefined,
    my_object_date: (new Date()),
    my_object_null: null
};


describe('AlJsonViewerComponent', () => {
    let component: AlJsonViewerComponent;
    let fixture: ComponentFixture<AlJsonViewerComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule
            ],
            declarations: [AlJsonViewerComponent],
            providers: [{ provide: 'segments', useValue: 'localSegments' }]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AlJsonViewerComponent);
        component = fixture.componentInstance;
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });

    describe("execution of functional tests - outside of UI", () => {
        it('should return false for isExpandble for all non-expandable types', () => {
            const types = ['string', 'number', 'date', 'undefined', 'boolean'];
            for (const t of types) {
                const o = (<any>Object).assign({}, testSegment, {
                    type: t
                });
                expect(component.isExpandable(o)).toBeFalsy();
            }
        });

        it('should return true for isExpandble for all expandable types', () => {
            const types = ['object', 'array'];
            for (const t of types) {
                const o = (<any>Object).assign({}, testSegment, {
                    type: t
                });
                expect(component.isExpandable(o)).toBeTruthy();
            }
        });
    });

    describe("UI and rendering tests with no initial data", () => {
        beforeEach(() => {
            component.json = "";
            component.expanded = false;
            fixture.detectChanges();
        });

        it("should segments length should be 0", () => {
            expect(component.segments.length).toEqual(0);
        });

        it("should have no innerHTML", () => {
            const childNodes: HTMLCollection = fixture.debugElement.nativeElement.querySelectorAll("section.segment");
            expect(childNodes.length).toEqual(0);
        });
    });

    describe("UI and rendering tests with an initial collapsed state", () => {

        beforeEach(() => {
            component.json = json;
            component.expanded = false;
            fixture.detectChanges();
        });

        describe("when instantiated", () => {
            it("should instantiate with 9 segments", () => {
                expect(component.segments.length).toEqual(9);
            });

            it('should be created with 9 HTML top level segment nodes', () => {
                const sections: HTMLAllCollection = fixture.debugElement.nativeElement.querySelectorAll("section.segment");
                expect(sections.length).toEqual(9);
            });

            it('should be created with 2 HTML top level expandable segment nodes', () => {
                const sections: HTMLAllCollection = fixture.debugElement.nativeElement.querySelectorAll("section.expandable");
                expect(sections.length).toEqual(2);
            });

            it("should have no expanded HTML nodes", () => {
                const sections: HTMLAllCollection = fixture.debugElement.nativeElement.querySelectorAll("section.expanded");
                expect(sections.length).toEqual(0);
            });
        });


        describe("when the first HTML node is clicked (a string node)", () => {
            it("should return the first segment for toggle and should have a class of segment-type-string", () => {
                const segment: any = component.segments[0];
                const node: HTMLElement = fixture.debugElement.nativeElement.querySelectorAll("section.segment")[0];
                const clickableNode: HTMLElement = fixture.debugElement.nativeElement.querySelectorAll("section.segment-main")[0];
                const classList: DOMTokenList = node.classList;

                jest.spyOn(component, "toggle");
                clickableNode.click();
                expect(component.toggle).toHaveBeenCalledWith(segment, expect.any(MouseEvent));
                expect(component.toggle).toHaveBeenCalledWith(mockStringSegment, expect.any(MouseEvent));

                expect(classList.contains("segment-type-string")).toBeTruthy();
            });
        });

        describe("when the fourth HTML node is clicked (an array node)", () => {
            it("should return the fourth segment for toggle and should have a class of segment-type-array", () => {
                const segment: any = component.segments[3];
                const event = {isTrusted: false} as MouseEvent;
                const node: HTMLElement = fixture.debugElement.nativeElement.querySelectorAll("section.segment")[3];
                const clickableNode: HTMLElement = fixture.debugElement.nativeElement.querySelectorAll("section.segment-main")[3];
                const classList: DOMTokenList = node.classList;

                jest.spyOn(component, "toggle");
                clickableNode.click();
                expect(component.toggle).toHaveBeenCalledWith(segment, expect.any(MouseEvent));
                // Clicking has expanded the segment
                expect(component.toggle).toHaveBeenCalledWith({ ...mockArraySegment, expanded: true }, expect.any(MouseEvent));

                expect(classList.contains("segment-type-array")).toBeTruthy();
            });
        });

    });

    describe("UI and rendering tests with an initial expanded state", () => {

        beforeEach(() => {
            component.json = json;
            component.expanded = true;
            fixture.detectChanges();
        });

        describe("when instantiated", () => {
            it("should instantiate with 9 segments", () => {
                expect(component.segments.length).toEqual(9);
            });

            it('should be created with 18 HTML top level segment nodes', () => {
                const sections: HTMLAllCollection = fixture.debugElement.nativeElement.querySelectorAll("section.segment");
                expect(sections.length).toEqual(18);
            });

            it('should be created with 5 HTML top level expandable segment nodes', () => {
                const sections: HTMLAllCollection = fixture.debugElement.nativeElement.querySelectorAll("section.expandable");
                expect(sections.length).toEqual(5);
            });

            it("should have 18 expanded HTML nodes", () => {
                const sections: HTMLAllCollection = fixture.debugElement.nativeElement.querySelectorAll("section.expanded");
                expect(sections.length).toEqual(18);
            });
        });
    });
});

