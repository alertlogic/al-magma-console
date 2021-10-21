import { AlOrdinalNumberPipe } from "./al-ordinal-number.pipe";

describe('AlOrdinalNumberPipe',()=>{

    const converter = new AlOrdinalNumberPipe();
    it('should work', () => {

        const tests: Array<[number|string,string]> = [
            // [-1,''],
            // [0,''],
            [1,'st'],
            [2,'nd'],
            [3,'rd'],
            [4,'th'],
            [5,'th'],
            [6,'th'],
            [7,'th'],
            [8,'th'],
            [9,'th'],
            [10,'th'],
            [11,'th'],
            [12,'th'],
            [13,'th'],
            [14,'th'],
            [15,'th'],
            [16,'th'],
            [17,'th'],
            [18,'th'],
            [19,'th'],
            [20,'th'],
            [21,'st'],
            [22,'nd'],
            [30,'th'],
            [40,'th'],
            [50,'th'],
            [60,'th'],
            [63,'rd'],
            [70,'th'],
            [80,'th'],
            [90,'th'],
            [100,'th'],
            [2001,'st'],
        ];

        tests.forEach(([input, output]:[number|string,string])=>{
            expect(converter.transform(input)).toEqual(`${input}${output}`);
            expect(converter.transform(input, false)).toEqual(output);

            expect(converter.transform(`${input}`)).toEqual(`${input}${output}`);
            expect(converter.transform(`${input}`, false)).toEqual(output);
        });



        const garbage:[any, any][] = [
            ['dog','dog'],
            ['',''],
        ];
        garbage.forEach(([input, output]:[any,any])=>{
            expect(converter.transform(input)).toEqual(output);
            expect(converter.transform(input, false)).toEqual(output);

            expect(converter.transform(`${input}`)).toEqual(output);
            expect(converter.transform(`${input}`, false)).toEqual(output);
        });

    });
});

