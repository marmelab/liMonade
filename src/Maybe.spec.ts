import { Just, Nothing } from './Maybe';
import { testApplicativeLaw } from './testUtils/testApplicativeLaw';
import { testFunctorLaw } from './testUtils/testFunctorLaw';
import { testMonadLaw } from './testUtils/testMonadLaw';
import { testTraversableLaw } from './testUtils/testTraversableLaw';

describe('Maybe', () => {
    describe('Just', () => {
        testFunctorLaw(Just);
        testMonadLaw(Just);
        testApplicativeLaw(Just);
        testTraversableLaw(Just);
    });

    describe('Nothing', () => {
        testFunctorLaw(Nothing);
        testMonadLaw(Nothing);
        testApplicativeLaw(Nothing);
        testTraversableLaw(Nothing);
    });
});
