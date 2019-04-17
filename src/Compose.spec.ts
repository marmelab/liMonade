import getCompose from './Compose';
import Either from './Either';
import Identity from './Identity';
import { testApplicativeLaw } from './testUtils/testApplicativeLaw';
import { testFunctorLaw } from './testUtils/testFunctorLaw';

describe('Compose', () => {
    const Compose = getCompose(Identity, Either);
    testFunctorLaw(Compose);
    testApplicativeLaw(Compose);
});
