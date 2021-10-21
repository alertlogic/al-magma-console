import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SidebarModule } from 'primeng/sidebar';
import { AlHelpSidebarComponent } from "./al-help-sidebar.component";
import { TestBed, ComponentFixture, waitForAsync } from "@angular/core/testing";
import { ButtonModule } from 'primeng/button';
import { DomSanitizer } from '@angular/platform-browser';

// TODO: fix me post angular 9
xdescribe('AlHelpSidebarComponent', () => {
    let component: AlHelpSidebarComponent;
    let fixture: ComponentFixture<AlHelpSidebarComponent>;
    const  iframeSafeResourceUrl:string="demo_iframe.htm";
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ AlHelpSidebarComponent ],
            imports: [SidebarModule,ButtonModule,BrowserAnimationsModule],
            providers:[{
                provide: DomSanitizer,
                useValue: {
                    sanitize: () => 'safeString',
                    bypassSecurityTrustResourceUrl: () => 'safeString'
                }
              },]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AlHelpSidebarComponent);
        component = fixture.componentInstance;
        component.iframeContentUrl = iframeSafeResourceUrl;
        fixture.detectChanges();
    });

    it('should be instantiated', () => {
        expect(component).toBeTruthy();
        expect(component.iframeSafeResourceUrl).toEqual('safeString');
    });

    it('call `open()` method', () => {
        component.open();
        expect(component.visible).toBeTruthy();
    });

    it('call `close()` method', () => {
        component.close();
        expect(component.visible).toBeFalsy();
    });
});
