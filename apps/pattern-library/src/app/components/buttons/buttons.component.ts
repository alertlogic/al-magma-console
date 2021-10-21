import { Component} from '@angular/core';

@Component({
  selector: 'al-buttons',
  templateUrl: './buttons.component.html',
  styleUrls: ['./buttons.component.scss']
})
export class ButtonsComponent  {

    public buttonExample = `<button type="button" icon="al al-logo" class="primary" pButton></button>`;
}
