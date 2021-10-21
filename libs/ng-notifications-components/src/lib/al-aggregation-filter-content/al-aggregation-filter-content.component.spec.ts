import {
    ComponentFixture,
    TestBed,
} from '@angular/core/testing';
import { AlAggregationFilterContentComponent } from './al-aggregation-filter-content.component';

describe('AlAggregationFilterContent', () => {
    let component: AlAggregationFilterContentComponent;
    let fixture: ComponentFixture<AlAggregationFilterContentComponent>;
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ AlAggregationFilterContentComponent ]
        }).compileComponents();
        fixture = TestBed.createComponent(AlAggregationFilterContentComponent);
        component = fixture.componentInstance;
    });

    it('should be initialize the component', () => {
        fixture.detectChanges();
        expect(component).toBeDefined();
    });
});
