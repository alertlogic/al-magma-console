import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'al-checkbox',
    templateUrl: './al-checkbox.component.html',
    styleUrls: ['./al-checkbox.component.scss']
})
export class AlCheckboxComponent implements OnInit {

    public static checkboxIndex = 0;

    @Input() label: string = '';
    @Input() checked: boolean = false;
    @Input() disabled: boolean = false;
    @Output() changed = new EventEmitter<boolean>();
    public checkboxId:string;

    ngOnInit(): void {
        this.checkboxId = `checkbox_${AlCheckboxComponent.checkboxIndex++}`;
    }

    changeCheck(event:Event) {
        this.changed.emit( (event.target as HTMLInputElement ).checked);
    }
}
