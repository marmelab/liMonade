import unaryFunction from './unaryFunction';

export default interface Monad {
    chain: (v: unaryFunction) => Monad;
}
