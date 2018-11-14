import { sum } from './';

describe('sum', () => {
    it('should add two number', () => {
        expect(sum(1, 2)).toEqual(3);
    });
});
