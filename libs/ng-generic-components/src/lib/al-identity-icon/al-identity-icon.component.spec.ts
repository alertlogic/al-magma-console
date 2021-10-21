import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AlIdentityIconComponent } from './al-identity-icon.component';
import { Component } from '@angular/core';

describe('AlIdentityIconComponent', () => {
    let component: TestHostIdentityIconComponent;
    let fixture: ComponentFixture<TestHostIdentityIconComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ AlIdentityIconComponent,TestHostIdentityIconComponent ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TestHostIdentityIconComponent);
        component = fixture.componentInstance;
        component.name = "default user name";
        fixture.detectChanges();
    });

    it('should be instantiated and called `ngOnChanges()`', () => {
        expect(component).toBeTruthy();

    });

});

@Component({
    template: `<al-identity-icon [name]="name" [circular]="true" [withLegend]="true"></al-identity-icon>`,
})
export class TestHostIdentityIconComponent {
    name: string;
}

