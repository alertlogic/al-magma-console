import chunk from 'lodash/chunk';

interface Input {
    url:string;
    headers:string;
    body:string;
}

// TODO: seperate the change with detecting to make detecting faster, use .search
export class DecodeService {

    /**
     * Given a HTTP request/response, the method splits its content and returns an object
     * @param {string} input
     * @returns {Input}
     */
    public static getInputObject(input:string):Input {
        /*
        A Request-line
        Zero or more headers (General|Request|Entity) fields followed by CRLF
        An empty line (i.e., a line with nothing preceding the CRLF)
        Optionally a message-body
        */
        const inputObject:Input = { url: '', headers: '', body: '' };
        const firstMatch        = input.match(/HTTP\/\d+\.\d+.*/);
        if (firstMatch) {
            inputObject.url = input.substring(0, firstMatch.index + firstMatch[0].length);
            input           = input.substring(firstMatch.index + firstMatch[0].length);
        }
        const secondMatch = input.match(/\n[\r]*\n/);
        if (secondMatch) {
            inputObject.headers = input.substring(0, secondMatch.index);
            inputObject.body    = input.substring(secondMatch.index);
        } else {
            inputObject.headers = input;
        }
        return inputObject;
    }

    public static decodeHex(input:string):string {
        return chunk(input.split(''), 2) // split the string into an array or arrays with 2 pieces
            .map(x => x.join('')) // join the child arrays into a string
            // .tap(x=>{ x[x.length-1] = _.padEnd(x[x.length-1],2,'0'); })
            // .map(x => _.padEnd(x, 2, '0')) // padd the last element if its not long enough
            .map((word:string) => parseInt(word, 16)) // turn the hex to an ascii int
            .map((word:number) => String.fromCharCode(word)) // turn the ascii int to a char
            .join(''); // get the value
    }

    public static decodeChar(input:string):string {

        return input.replace(
            /n?cha?r\((\d{1,3}(,\d{1,3})*)\)/ig,
            (fullString:string, numbers:string) => numbers.split(',')
                .map((x:string) => parseInt(x, 10))
                .map((x:number) => String.fromCharCode(x))
                .join(''),
        );
    }

    /*
    url decoding

     */
    public static decodePercent(input:string):string {
        return input.replace(
            /%([a-f\d]{2})/ig,
            (fullString:string, hex:string):string => DecodeService.decodeHex(hex),
        );
    }

    public static decodePlusSpace(input:string):string {
        return input.replace(/\+/g, ' ');
    }

    public static fromHex(h:string):string {
        let str = '';
        for (let i = 0; i < h.length; i += 2) {
            str += String.fromCharCode(parseInt(h.substr(i, 2), 16));
        }
        return str;
    }

    /*
        0x3C7230783E -> <r0x>
     */
    public static decodeMySqlHex(input:string):string {
        return input.replace(/0x([0-9a-f]+)/gi, (x:string) => DecodeService.fromHex(x));
    }

    /*
        'r||3'   ->   'r3'
        'SELECT CHR(75)||CHR(76)||CHR(77)' -> 'SELECT CHAR(75)CHR(76)CHR(77)'
     */
    public static decodeOraclePipe(input:string):string {
        return input.replace(/(.?)\|\|(.?)/gm, '$1$2');
    }

    public static decodeBlockComment(input:string):string {
        const inputObject   = DecodeService.getInputObject(input);
        inputObject.url     = inputObject.url.replace(/\/\*[^*]*\*\//g, '');
        inputObject.body    = inputObject.body.replace(/\/\*[^*]*\*\//g, '');
        inputObject.headers = inputObject.headers.replace(/\/\*[^*\n]*\*\//g, '');
        return inputObject.url + inputObject.headers + inputObject.body;
    }

    public static decodeUnicode(input:string):string {
        return input.replace(/\\u([a-f\d]{4,6})/ig, (fs, s) => String.fromCharCode(parseInt(s, 16)));

    }

}
