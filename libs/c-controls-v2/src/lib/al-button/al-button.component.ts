import { IconClass, IconSize, BtnType } from './../types/al-common.types';
import { Component, Input, HostBinding, OnInit } from '@angular/core';


@Component({
  selector: 'ald-button',
  templateUrl: './al-button.component.html',
  styleUrls: ['./al-button.component.scss']
})
export class AlButtonComponent implements OnInit{

  @HostBinding('class') class = 'ald-btn';

  /**
   * The button label.
   *
   */
  @Input() label: string;

  /**
   * The button type and style.
   */
  @Input() type?: BtnType = BtnType.default;

  /**
   * Optionally give it an icon - use the icon name/class.
   */
  @Input() icon?: string;

  /**
   * Specify the icon class to use. Default is "material-icons.
   */
  @Input() iconClass?: IconClass = IconClass.materialIcons;

  /**
   * Specify the icon position. Default is "left".
   */
  @Input() iconPos?: 'left' | 'right' = 'left';

  /**
   * Specify a button size. Default is medium: "md".
   */
  @Input() size?: 'xs' | 'sm' | 'md' | 'lg' = 'md';

  /**
   * Sets the button state to disabled.
   */
  @Input() disabled?: boolean;

  /**
   * Fits to the full width of their container
   */
  @Input() fullwidth?: boolean;

  /**
   * Sets the button state to selected. This is used in button groups with toggle.
   */
  @Input() selected?: boolean;

  /**
   * Sets the button to a loading state - with spinning hedgehogs.
   */
  @Input() loading?: boolean;

  /**
   * Icon size is calculated based on the button size and presence of the label.
   */
  iconSize: IconSize = IconSize.sm;

  ngOnInit() {
    if (this.size === 'lg') {
      this.iconSize = IconSize.md;
    }

    if (!this.label && (this.size === 'md' || this.size === 'lg')) {
      this.iconSize = IconSize.md;
    }
  }

}
