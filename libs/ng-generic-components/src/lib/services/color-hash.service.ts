import { Injectable } from "@angular/core";
@Injectable()
export class ChromaHash {

    public chromahash(str:string):string {

        // we need to prefix the string to ensure different values for r/g/b but also
        // if we only suffix we seem to get clustering around purple and yellow
        const rStr = `red${str}`;
        const gStr = `green${str}`;
        const bStr = `blue${str}`;

        const rHex = this.toHex(this.to256ish(this.djb2(rStr)));
        const gHex = this.toHex(this.to256ish(this.djb2(gStr)));
        const bHex = this.toHex(this.to256ish(this.djb2(bStr)));

        return `#${rHex}${gHex}${bHex}`;
    }

    public checkBrightness(str:string):string {
        const color = (str.charAt(0) === '#') ? str.substring(1, 7) : str;
        const r     = parseInt(color.substring(0, 2), 16); // hexToR
        const g     = parseInt(color.substring(2, 4), 16); // hexToG
        const b     = parseInt(color.substring(4, 6), 16); // hexToB

        const hsl = this.rgbToHsl(r, g, b);
        if (hsl[2] < 0.2) {
            hsl[2] = 0.2;
        }
        const rgb = this.hslToRgb(hsl[0], hsl[1], hsl[2]);
        return `#${rgb.map((i) => this.toHex(i)).join('')}`;


    }

    public pickTextColorBasedOnBgColorAdvanced(bgColor:string, lightColor = '#FFFFFF', darkColor = '#000000'):string {
        const color    = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
        const r        = parseInt(color.substring(0, 2), 16); // hexToR
        const g        = parseInt(color.substring(2, 4), 16); // hexToG
        const b        = parseInt(color.substring(4, 6), 16); // hexToB
        const uicolors = [r / 255, g / 255, b / 255];
        const c        = uicolors.map((col) => {
            if (col <= 0.03928) {
                return col / 12.92;
            }
            return Math.pow((col + 0.055) / 1.055, 2.4);
        });
        const L        = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
        return (L > 0.179) ? darkColor : lightColor;
    }

    private djb2(str:string):number {
        let hash:number = 5381;
        for (let i = 0; i < str.length; i++) {
            const char:number = str.charCodeAt(i);
            hash            = (hash << 5) + hash + char;
            /* hash * 33 + c */
        }

        return hash;
    }

    // simple modulo hash to convert an int to a number from 0 - 255 (or so)
    private to256ish(i:number):number {
        // djb2 uses 33 as it's prime... should we then use k = 25 (coprime to 33),
        // m = 10 to get a 256ish number? k = 251 seems to work
        // does k even need to be prime here?
        const k = 5;
        const m = 256 / k;

        return (Math.abs(i) % k) * m;
    }

    // convert a digit (base 10) to hex (base 16) left padded with 0
    private toHex(d:number):string {
        return (`0${Number(d).toString(16)}`).slice(-2);
    }

    /**
     * Converts an RGB color value to HSL. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes r, g, and b are contained in the set [0, 255] and
     * returns h, s, and l in the set [0, 1].
     *
     * @param     r       The red color value
     * @param     g       The green color value
     * @param     b       The blue color value
     * @return  Array           The HSL representation
     */
    private rgbToHsl(r:number, g:number, b:number):[ number, number, number ] {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h:number;
        let s:number;
        const l:number = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s       = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }

        return [h, s, l];
    }


    private hue2rgb(p:number, q:number, t:number):number {
        if (t < 0) {
            t += 1;
        }
        if (t > 1) {
            t -= 1;
        }
        if (t < 1 / 6) {
            return p + (q - p) * 6 * t;
        }
        if (t < 1 / 2) {
            return q;
        }
        if (t < 2 / 3) {
            return p + (q - p) * (2 / 3 - t) * 6;
        }
        return p;
    }

    /**
     * Converts an HSL color value to RGB. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes h, s, and l are contained in the set [0, 1] and
     * returns r, g, and b in the set [0, 255].
     *
     * @param   h       The hue
     * @param   s       The saturation
     * @param   l       The lightness
     * @return  Array           The RGB representation
     */
    private hslToRgb(h:number, s:number, l:number):[ number, number, number ] {
        let r;
        let g;
        let b;

        if (s === 0) {
            r = g = b = l; // achromatic
        } else {

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r     = this.hue2rgb(p, q, h + 1 / 3);
            g     = this.hue2rgb(p, q, h);
            b     = this.hue2rgb(p, q, h - 1 / 3);
        }

        return [r * 255, g * 255, b * 255];
    }
}
