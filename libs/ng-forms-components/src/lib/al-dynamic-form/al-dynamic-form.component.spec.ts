import {
    ComponentFixture,
    TestBed,
} from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TooltipModule } from 'primeng/tooltip';
import { MonacoEditorModule } from '@materia-ui/ngx-monaco-editor';

import { AlDynamicFormComponent } from './al-dynamic-form.component';
import { AlDynamicFormElementComponent } from './al-dynamic-form-element/al-dynamic-form-element.component';
import { AlDownloadButtonElementComponent } from './al-dynamic-form-element/download-button/al-download-button-element.component';
import { ButtonModule } from 'primeng/button';
import { MarkdownModule } from 'ngx-markdown';

describe('AlDynamicFormComponent', () => {
    let component: AlDynamicFormComponent;
    let fixture: ComponentFixture<AlDynamicFormComponent>;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports:[
                CheckboxModule,
                CheckboxModule,
                DropdownModule,
                FormsModule,
                InputTextModule,
                InputTextareaModule,
                MonacoEditorModule,
                ReactiveFormsModule,
                RadioButtonModule,
                TooltipModule,
                ButtonModule,
                MarkdownModule.forRoot()],
            declarations: [ AlDynamicFormComponent, AlDynamicFormElementComponent, AlDownloadButtonElementComponent ]
        }).compileComponents();
        fixture = TestBed.createComponent(AlDynamicFormComponent);
        component = fixture.componentInstance;
    });

    it('should be initialize the component', () => {
        fixture.detectChanges();
        expect(component).toBeDefined();
    });
});
