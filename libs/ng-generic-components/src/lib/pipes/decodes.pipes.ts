import {
    Pipe,
    PipeTransform,
} from '@angular/core';
import { DecodeService } from '../services/decode.service';
import { Decode64Service } from '../services/decode64.service';

@Pipe({ name: 'mySocDecodes' })
export class DecodesPipe implements PipeTransform {

    constructor(protected decode64Service:Decode64Service) {
    }

    static getAvailableTransforms():string[] {
        return ['URL', '||', 'SQL', 'Base64', '/**/', 'unicode', '+', '0x'];
    }

    transform(input:string, decodes:string):string {

        let result = input;
        decodes.split(',').forEach((decode:string) => {
            switch (decode.toLowerCase().trim()) {
                case '':
                    break;
                case 'base64':
                    result = this.decode64Service.streamDecode(result);
                    break;
                case 'hex':
                    result = DecodeService.decodeHex(result);
                    break;
                case 'char':
                case 'sql':
                    result = DecodeService.decodeChar(result);
                    break;
                case 'percent':
                case 'url':
                    result = DecodeService.decodePercent(result);
                    break;
                case '||':
                    result = DecodeService.decodeOraclePipe(result);
                    break;
                case '/**/':
                    result = DecodeService.decodeBlockComment(result);
                    break;
                case 'unicode':
                    result = DecodeService.decodeUnicode(result);
                    break;
                case '+':
                    result = DecodeService.decodePlusSpace(result);
                    break;
                case '0x':
                    result = DecodeService.decodeMySqlHex(result);
                    break;
                default:
                    console.log('got a decode that I dont recognize:', decode);
                    break;

            }
        });

        return result;

    }

}
