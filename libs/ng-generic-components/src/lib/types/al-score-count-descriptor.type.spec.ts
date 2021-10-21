/**
 * Test suite for the al-score-count-descriptor.type
 *
 * @author Juan Leon <jleon@alertlogic.com>
 * @copyright Alert Logic, Inc 2018
 */

import { AlScoreCountDescriptor } from './al-score-count-descriptor.type';

describe('AlScoreCountDescriptor Class', () => {

    let data = {
        critical: 2,
        high: 3,
        medium: 4,
        low: 5,
        none: 6,
        info: 7,
        count: 100
    };
    let scoreCountDescriptorInitial: AlScoreCountDescriptor = AlScoreCountDescriptor.import(data);
    let scoreCountDescriptorEmpty: AlScoreCountDescriptor = AlScoreCountDescriptor.import({});

    describe('WHEN the class ItemMenuDescriptor is created', () => {
        it('SHOULD match with initial types', () => {
            expect(scoreCountDescriptorInitial.critical).toEqual(expect.any(Number));
            expect(scoreCountDescriptorInitial.high).toEqual(expect.any(Number));
            expect(scoreCountDescriptorInitial.medium).toEqual(expect.any(Number));
            expect(scoreCountDescriptorInitial.low).toEqual(expect.any(Number));
            expect(scoreCountDescriptorInitial.none).toEqual(expect.any(Number));
            expect(scoreCountDescriptorInitial.info).toEqual(expect.any(Number));
            expect(scoreCountDescriptorInitial.count).toEqual(expect.any(Number));
        });

        it('SHOULD match with initial values', () => {
            expect(scoreCountDescriptorInitial.critical).toEqual(2);
            expect(scoreCountDescriptorInitial.high).toEqual(3);
            expect(scoreCountDescriptorInitial.medium).toEqual(4);
            expect(scoreCountDescriptorInitial.low).toEqual(5);
            expect(scoreCountDescriptorInitial.none).toEqual(6);
            expect(scoreCountDescriptorInitial.info).toEqual(7);
            expect(scoreCountDescriptorInitial.count).toEqual(18);
        });

        it('SHOULD match with initial values', () => {
            expect(scoreCountDescriptorEmpty.critical).toEqual(0);
            expect(scoreCountDescriptorEmpty.high).toEqual(0);
            expect(scoreCountDescriptorEmpty.medium).toEqual(0);
            expect(scoreCountDescriptorEmpty.low).toEqual(0);
            expect(scoreCountDescriptorEmpty.none).toEqual(0);
            expect(scoreCountDescriptorEmpty.info).toEqual(0);
            expect(scoreCountDescriptorEmpty.count).toEqual(0);
        });
    });

});
