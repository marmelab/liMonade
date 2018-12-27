import IO from './IO';
import { testApplicativeLaw } from './testUtils/testApplicativeLaw';
import { testFunctorLaw } from './testUtils/testFunctorLaw';
import { testMonadLaw } from './testUtils/testMonadLaw';

const getIOValue = <T>(io: IO<T>) => io.computation();

describe.only('IO', () => {
    testFunctorLaw(IO, getIOValue);
    testMonadLaw(IO, getIOValue);
    testApplicativeLaw(IO, getIOValue);
});
