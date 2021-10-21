import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AlSelectorComponent } from './al-selector.component';
import { AlSelectorItem } from './al-selector.types';

describe('AlSelectorComponent', () => {
    let testHostComponent: TestHostComponent;
    let testHostFixture: ComponentFixture<TestHostComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [],
            declarations: [AlSelectorComponent, TestHostComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        const selectors: AlSelectorItem[] = [
            {
                name: "7d",
                value: "7d"
            },
            {
                name: "14d",
                value: "14d",
                selected: true
            }
        ];

        testHostFixture = TestBed.createComponent(TestHostComponent);
        testHostComponent = testHostFixture.componentInstance;
        testHostComponent.setSelectors(selectors);
        testHostFixture.detectChanges();
    });

    it('should be instantiated', () => {
        expect(testHostComponent).toBeTruthy();
    });

    it('should have a legend', () => {
        const radios: HTMLInputElement[] = testHostFixture.nativeElement.querySelectorAll('input[type="radio"]');
        expect(radios[1].checked).toEqual(true);
    });

    it('should uncheck the radio when the clear method is called', () => {
        const radios: HTMLInputElement[] = testHostFixture.nativeElement.querySelectorAll('input[type="radio"]');
        const alertComponent = testHostFixture.debugElement.query(By.directive(AlSelectorComponent)) as DebugElement;
        alertComponent.componentInstance.clear();
        expect(radios[1].checked).toEqual(false);
    });

    it('radio should be checked if an element is marked as checked', () => {
        expect(testHostFixture.nativeElement.querySelector('legend').textContent).toEqual('Test Title');
    });

    it('should be contain two radio inputs and two labels', () => {
        expect(testHostFixture.nativeElement.querySelectorAll('input[type="radio"]').length).toEqual(2);
        expect(testHostFixture.nativeElement.querySelectorAll('label').length).toEqual(2);
    });

    it('should generate the same name for each radio', () => {
        const radios: HTMLInputElement[] = testHostFixture.nativeElement.querySelectorAll('input[type="radio"]');
        expect(radios[0].name).toEqual('radioALSelector-1');
        expect(radios[1].name).toEqual('radioALSelector-1');
    });

    it('should generate unique id for each radio', () => {
        const radios: HTMLInputElement[] = testHostFixture.nativeElement.querySelectorAll('input[type="radio"]');
        expect(radios[0].id).toEqual('radioALSelector-1-0');
        expect(radios[1].id).toEqual('radioALSelector-1-1');
    });

    it('should emit the correct value when a change has occurred', () => {
        const radios: HTMLInputElement[] = testHostFixture.nativeElement.querySelectorAll('input[type="radio"]');
        const e: Event = new Event('change');

        jest.spyOn(testHostComponent, 'itemSelected');
        radios[0].checked = true;
        radios[0].dispatchEvent(e);
        expect(testHostComponent.itemSelected).toHaveBeenCalledWith('7d');
    });

    @Component({
        selector: 'al-host-component',
        template: `<al-selector [title]="'Test Title'" [selectors]='selectors' (selected)='itemSelected($event)'></al-selector>`
    })
    class TestHostComponent {
        public selectors: AlSelectorItem[] = [];

        setSelectors(selectors: AlSelectorItem[]) {
            this.selectors = selectors;
        }

        itemSelected(value: string) {
            return;
        }
    }
});

