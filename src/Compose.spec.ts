import getCompose from './Compose';
import Either from './Either';
import Identity from './Identity';
// import { testFunctorLaw } from './testUtils/testFunctorLaw';
import { testApplicativeLaw } from './testUtils/testApplicativeLaw';

describe('Compose', () => {
    const Compose = getCompose(Identity, Either);
    // testFunctorLaw(Compose);
    testApplicativeLaw(Compose);
});
