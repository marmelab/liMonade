import unaryFunction from './unaryFunction';

export default interface Functor<T> {
    name: T;
    map: (v: unaryFunction) => Functor<T>;
}
