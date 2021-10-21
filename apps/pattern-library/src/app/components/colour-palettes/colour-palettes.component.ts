import { Component } from '@angular/core';

@Component({
  selector: 'app-colour-palettes',
  templateUrl: './colour-palettes.component.html',
  styleUrls: ['./colour-palettes.component.scss']
})
export class ColourPalettesComponent {

  public alContrastLight = '#FFF';
  public alContrastDark = '#424242';

  public palettes: any = [
    {
      name: '$al-yellow',
      colors: [
        { name: '50', color: '#FFFAEC', contrast: this.alContrastDark },
        { name: '100', color: '#FFF2C9', contrast: this.alContrastDark },
        { name: '200', color: '#FFE9A6', contrast: this.alContrastDark },
        { name: '300', color: '#FFE183', contrast: this.alContrastLight },
        { name: '400', color: '#FFDB6B', contrast: this.alContrastLight },
        { name: '500', color: '#FFD54F', contrast: this.alContrastLight },
        { name: '600', color: '#FCC101', contrast: this.alContrastLight },
        { name: '700', color: '#FFD800', contrast: this.alContrastLight },
        { name: '800', color: '#FFED18', contrast: this.alContrastDark },
        { name: '900', color: '#FFF36C', contrast: this.alContrastDark },
      ]
    },
    {
      name: '$al-amber',
      colors: [
        { name: '50', color: '#FFF7EC', contrast: this.alContrastDark },
        { name: '100', color: '#FFE9C8', contrast: this.alContrastDark },
        { name: '200', color: '#FFDAA5', contrast: this.alContrastDark },
        { name: '300', color: '#FFCC81', contrast: this.alContrastLight },
        { name: '400', color: '#FFC167', contrast: this.alContrastLight },
        { name: '500', color: '#FFB74D', contrast: this.alContrastLight },
        { name: '600', color: '#FFAA00', contrast: this.alContrastLight },
        { name: '700', color: '#FFA100', contrast: this.alContrastLight },
        { name: '800', color: '#FF9900', contrast: this.alContrastLight },
        { name: '900', color: '#FF9900', contrast: this.alContrastLight },
      ]
    },
    {
      name: '$al-orange',
      colors: [
        { name: '50', color: '#FFF3DF', contrast: this.alContrastDark },
        { name: '100', color: '#FFE1AF', contrast: this.alContrastDark },
        { name: '200', color: '#FFCD7A', contrast: this.alContrastDark },
        { name: '300', color: '#FFB840', contrast: this.alContrastLight },
        { name: '400', color: '#FFA800', contrast: this.alContrastLight },
        { name: '500', color: '#F78C1E', contrast: this.alContrastLight },
        { name: '600', color: '#F57C00', contrast: this.alContrastLight },
        { name: '700', color: '#F06C00', contrast: this.alContrastLight },
        { name: '800', color: '#F05F11', contrast: this.alContrastLight },
        { name: '900', color: '#E65100', contrast: this.alContrastLight },
      ]
    },
    {
      name: '$al-red',
      colors: [
        { name: '50', color: '#FFEBEE', contrast: this.alContrastDark },
        { name: '100', color: '#FFCDD2', contrast: this.alContrastDark },
        { name: '200', color: '#EF9A9A', contrast: this.alContrastLight },
        { name: '300', color: '#F48683', contrast: this.alContrastLight },
        { name: '400', color: '#F16C69', contrast: this.alContrastLight },
        { name: '500', color: '#EF534F', contrast: this.alContrastLight },
        { name: '600', color: '#E53935', contrast: this.alContrastLight },
        { name: '700', color: '#D32F2F', contrast: this.alContrastLight },
        { name: '800', color: '#C62828', contrast: this.alContrastLight },
        { name: '900', color: '#B71C1C', contrast: this.alContrastLight },
      ]
    },
    {
      name: '$al-purple',
      colors: [
        { name: '50', color: '#F7EEF9', contrast: this.alContrastDark },
        { name: '100', color: '#E9D0EE', contrast: this.alContrastDark },
        { name: '200', color: '#DCB2E3', contrast: this.alContrastLight },
        { name: '300', color: '#CE94D8', contrast: this.alContrastLight },
        { name: '400', color: '#C47DD0', contrast: this.alContrastLight },
        { name: '500', color: '#BA67C8', contrast: this.alContrastLight },
        { name: '600', color: '#AC5FBA', contrast: this.alContrastLight },
        { name: '700', color: '#9652A1', contrast: this.alContrastLight },
        { name: '800', color: '#8A4B94', contrast: this.alContrastLight },
        { name: '900', color: '#7E4587', contrast: this.alContrastLight },
      ]
    },
    {
      name: '$al-gray',
      colors: [
        { name: '50', color: '#EDEDED', contrast: this.alContrastDark },
        { name: '100', color: '#CBCBCB', contrast: this.alContrastLight },
        { name: '200', color: '#A8A8A8', contrast: this.alContrastLight },
        { name: '300', color: '#868686', contrast: this.alContrastLight },
        { name: '400', color: '#6C6C6C', contrast: this.alContrastLight },
        { name: '500', color: '#535353', contrast: this.alContrastLight },
        { name: '600', color: '#474747', contrast: this.alContrastLight },
        { name: '700', color: '#3B3B3B', contrast: this.alContrastLight },
        { name: '800', color: '#2E2E2E', contrast: this.alContrastLight },
        { name: '900', color: '#212121', contrast: this.alContrastLight },
      ]
    },
    {
      name: '$al-blue',
      colors: [
        { name: '50', color: '#EAF1FE', contrast: this.alContrastDark },
        { name: '100', color: '#C4D8FC', contrast: this.alContrastDark },
        { name: '200', color: '#9DC0FA', contrast: this.alContrastLight },
        { name: '300', color: '#77A7F9', contrast: this.alContrastLight },
        { name: '400', color: '#5A94F8', contrast: this.alContrastLight },
        { name: '500', color: '#3E82F7', contrast: this.alContrastLight },
        { name: '600', color: '#3B7BEB', contrast: this.alContrastLight },
        { name: '700', color: '#3774DE', contrast: this.alContrastLight },
        { name: '800', color: '#346ED1', contrast: this.alContrastLight },
        { name: '900', color: '#3167C4', contrast: this.alContrastLight },
      ]
    },
    {
      name: '$al-smokeBlue',
      colors: [
        { name: '50', color: '#EDF4FA', contrast: this.alContrastDark },
        { name: '100', color: '#CBE2F2', contrast: this.alContrastDark },
        { name: '200', color: '#AACFEA', contrast: this.alContrastLight },
        { name: '300', color: '#88BCE2', contrast: this.alContrastLight },
        { name: '400', color: '#6FAEDC', contrast: this.alContrastLight },
        { name: '500', color: '#57A0D7', contrast: this.alContrastLight },
        { name: '600', color: '#5195C9', contrast: this.alContrastLight },
        { name: '700', color: '#4B8CBD', contrast: this.alContrastLight },
        { name: '800', color: '#4682B0', contrast: this.alContrastLight },
        { name: '900', color: '#4179A3', contrast: this.alContrastLight },
      ]
    },
    {
      name: '$al-green',
      colors: [
        { name: '50', color: '#F2F9F2', contrast: this.alContrastDark },
        { name: '100', color: '#D9EED9', contrast: this.alContrastDark },
        { name: '200', color: '#C0E3C1', contrast: this.alContrastDark },
        { name: '300', color: '#A6D7A8', contrast: this.alContrastLight },
        { name: '400', color: '#93CF95', contrast: this.alContrastLight },
        { name: '500', color: '#81C783', contrast: this.alContrastLight },
        { name: '600', color: '#79BA7B', contrast: this.alContrastLight },
        { name: '700', color: '#71AD73', contrast: this.alContrastLight },
        { name: '800', color: '#68A16A', contrast: this.alContrastLight },
        { name: '900', color: '#609462', contrast: this.alContrastLight },
      ]
    },
    {
      name: '$db-slate',
      colors: [
        { name: '50', color: '#EBECEF', contrast: this.alContrastDark },
        { name: '100', color: '#C3C8CF', contrast: this.alContrastDark },
        { name: '200', color: '#9BA4AF', contrast: this.alContrastLight },
        { name: '300', color: '#748090', contrast: this.alContrastLight },
        { name: '400', color: '#566578', contrast: this.alContrastLight },
        { name: '500', color: '#394B61', contrast: this.alContrastLight },
        { name: '600', color: '#324153', contrast: this.alContrastLight },
        { name: '700', color: '#2A3849', contrast: this.alContrastLight },
        { name: '800', color: '#1E2B38', contrast: this.alContrastLight },
        { name: '900', color: '#17202A', contrast: this.alContrastLight },
      ]
    },
    {
      name: '$db-blue',
      colors: [
        { name: '50', color: '#EFF2F6', contrast: this.alContrastDark },
        { name: '100', color: '#D1D9E3', contrast: this.alContrastDark },
        { name: '200', color: '#B3C1D1', contrast: this.alContrastLight },
        { name: '300', color: '#95A8BF', contrast: this.alContrastLight },
        { name: '400', color: '#7E95B1', contrast: this.alContrastLight },
        { name: '500', color: '#6883A4', contrast: this.alContrastLight },
        { name: '600', color: '#536984', contrast: this.alContrastLight },
        { name: '700', color: '#44576E', contrast: this.alContrastLight },
        { name: '800', color: '#3A4B5E', contrast: this.alContrastLight },
        { name: '900', color: '#344354', contrast: this.alContrastLight },
      ]
    },
    {
      name: '$db-charts',
      colors: [
        { name: '50', color: '#5C3A49', contrast: this.alContrastLight },
        { name: '100', color: '#793C49', contrast: this.alContrastLight },
        { name: '200', color: '#A13E48', contrast: this.alContrastLight },
        { name: '300', color: '#C84049', contrast: this.alContrastLight },
        { name: '400', color: '#F04349', contrast: this.alContrastLight },
        { name: '500', color: '#1592E6', contrast: this.alContrastLight },
        { name: '600', color: '#1688D6', contrast: this.alContrastLight },
        { name: '700', color: '#187FC6', contrast: this.alContrastLight },
        { name: '800', color: '#1A76B6', contrast: this.alContrastLight },
        { name: '900', color: '#1F6597', contrast: this.alContrastLight },
      ]
    },
    {
      name: '$al-essentials',
      colors: [
        { name: '400', color: '#03638A', contrast: this.alContrastLight },
        { name: '500', color: '#025070', contrast: this.alContrastLight }
      ]
    },
    {
      name: '$al-professional',
      colors: [
        { name: '500', color: '#025070', contrast: this.alContrastLight }
      ]
    },
    {
      name: '$al-essentials',
      colors: [
        { name: '500', color: '#3FC6F1', contrast: this.alContrastLight }
      ]
    },


  ];

}
