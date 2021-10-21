import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AlCadenceSelectorComponent } from './al-cadence-selector.component';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';

describe('AlCadenceSelectorComponent', () => {
    let component: AlCadenceSelectorComponent;
    let fixture: ComponentFixture<AlCadenceSelectorComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [CalendarModule, DropdownModule, FormsModule],
            declarations: [AlCadenceSelectorComponent],
        }).compileComponents();
        fixture = TestBed.createComponent(AlCadenceSelectorComponent);
        component = fixture.componentInstance;
    });

    it('should be initialize the component', () => {
        fixture.detectChanges();
        expect(component).toBeDefined();
    });

    describe('SHOULD set the options WHEN setOptions is called', () => {

        it('SHOULD set daily in the options WHEN it is in the input', () => {
            component.setOptions(['daily']);

            expect(component.options.length).toEqual(1);
            expect(component.options[0].label).toEqual('Daily');
            expect(component.options[0].value.key).toEqual('daily');
        });

        it('SHOULD set weekly in the options WHEN it is in the input', () => {
            component.setOptions(['weekly']);

            expect(component.options.length).toEqual(1);
            expect(component.options[0].label).toEqual('Weekly');
            expect(component.options[0].value.key).toEqual('weekly');
        });

        it('SHOULD set monthly in the options WHEN it is in the input', () => {
            component.setOptions(['monthly']);

            expect(component.options.length).toEqual(1);
            expect(component.options[0].label).toEqual('Monthly');
            expect(component.options[0].value.key).toEqual('monthly');
        });

        it('SHOULD set none in the options WHEN there is not math with the supported options', () => {
            component.setOptions(['asd']);
            expect(component.options.length).toEqual(0);
        });

        it('SHOULD set 3 options WHEN there are 3 valid inputs', () => {
            component.setOptions(['monthly', 'weekly', 'daily']);
            expect(component.options.length).toEqual(3);
        });
    });

});
