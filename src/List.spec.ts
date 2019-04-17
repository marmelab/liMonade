import List from './List';
import { testApplicativeLaw } from './testUtils/testApplicativeLaw';
import { testFunctorLaw } from './testUtils/testFunctorLaw';
import { testMonadLaw } from './testUtils/testMonadLaw';
import { testTraversableLaw } from './testUtils/testTraversableLaw';

describe('List', () => {
    testFunctorLaw(List);
    testMonadLaw(List);
    testApplicativeLaw(List);
    testTraversableLaw(List);
});
