import Identity from './Identity';

import { testApplicativeLaw } from './testUtils/testApplicativeLaw';
import { testFunctorLaw } from './testUtils/testFunctorLaw';
import { testMonadLaw } from './testUtils/testMonadLaw';
import { testTraversableLaw } from './testUtils/testTraversableLaw';

describe('Identity', () => {
    testFunctorLaw(Identity);
    testMonadLaw(Identity);
    testApplicativeLaw(Identity);
    testTraversableLaw(Identity);
});
