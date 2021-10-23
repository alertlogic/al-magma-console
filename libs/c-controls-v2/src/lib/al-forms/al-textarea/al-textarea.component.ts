import { Component, EventEmitter, Input, OnInit, Optional, Output, Self } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

@Component({
  selector: 'ald-textarea',
  templateUrl: './al-textarea.component.html',
  styleUrls: ['./al-textarea.component.scss']
})
export class AlTextareaComponent implements OnInit, ControlValueAccessor {

  @Input() label?:            string   = '';
  @Input() placeholder?:      string   = ' ';
  @Input() type?:             string   = 'text';
  @Input() name?:             string   = this.label;
  @Input() cols?:             number   = 30;
  @Input() rows?:             number   = 3;
  @Input() id?:               string;
  @Input() disabled?:         boolean  = false;
  @Input() autofocus:         boolean  = false;
  @Input() required?:         boolean  = false;
  @Input() requiredError?:    string;
  @Input() hint?:             string;
  @Input() tip?:              string;
  @Input() error?:            string;
  @Input() verticalSpace?:    boolean = true;

  @Input() inputModel:        string | number;
  @Output() inputModelChange: EventEmitter<string | number> = new EventEmitter();

  onChanged: any = () => { }
  onTouched: any = () => { }

  constructor(@Optional() @Self() public ngControl: NgControl) {
    if (this.ngControl != null) {
      // Setting the value accessor directly (instead of using
      // the providers) to avoid running into a circular import.
      this.ngControl.valueAccessor = this;
    }

  }

  get control() {
    return this.ngControl?.control;
  }

  ngOnInit(): void {
    this.id = this.id || this.label;
  }


  onValueChange(newValue?: string | number) {
    if (newValue === undefined) {
      this.onChanged(this.inputModel);
    } else {
      this.onChanged(newValue);
      this.inputModel = newValue;
    }
  }
  writeValue(value: any) {
    this.inputModel = value;
  }
  registerOnChange(fn: any) {
    this.onChanged = fn
  }
  registerOnTouched(fn: any) {
    this.onTouched = fn
  }

  setDisabledState(val: boolean): void {
    this.disabled = val;
  }

  onChange() {
    this.inputModelChange.emit(this.inputModel);
  }

}
