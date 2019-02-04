import List from './List';
import { testApplicativeLaw } from './testUtils/testApplicativeLaw';
import { testFunctorLaw } from './testUtils/testFunctorLaw';
import { testMonadLaw } from './testUtils/testMonadLaw';
import Writer from './Writer';

describe('Writer', () => {
    testFunctorLaw(Writer);
    testMonadLaw(Writer);
    testApplicativeLaw(Writer);

    it('should allow to chain writer while preserving all log', () => {
        const double = (v: number) => Writer(v * 2, ['multiply by 2']);
        const increment = (v: number) => Writer(v + 1, ['add 1']);

        const a = Writer(5, ['start with 5'])
            .chain(double)
            .chain(increment);

        expect(a.readLog()).toEqual(['start with 5', 'multiply by 2', 'add 1']);
        expect(a.readValue()).toBe(11);
    });

    it('should allow to convert a list of writer into a writer of list while preserving log', () => {
        const list = List.fromArray([
            Writer(1, ['log 1']),
            Writer(2, ['log 2', 'log 3']),
            Writer(3, ['log 4']),
        ]);

        const writer = list.sequence(Writer.of);

        expect(writer.readLog()).toEqual(['log 4', 'log 2', 'log 3', 'log 1']);

        expect(writer.readValue()).toEqual(List.fromArray([1, 2, 3]));
    });
});
