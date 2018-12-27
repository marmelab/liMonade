import { testApplicativeLaw } from './testUtils/testApplicativeLaw';
import { testFunctorLaw } from './testUtils/testFunctorLaw';
import { testMonadLaw } from './testUtils/testMonadLaw';
import Writer from './Writer';

describe('Writer', () => {
    testFunctorLaw(Writer);
    testMonadLaw(Writer);
    testApplicativeLaw(Writer);
});
