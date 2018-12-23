import { Applicative } from './types';

export interface Pointed<Kind> {
    of<T>(v: T): Applicative<T, Kind, Kind>;
}

// The functor that compose functors.
// It allows to operate on a value nested in two functors `Functor(Functor(value))`.
// Needed to test Traversable law. You will probably never use it.
const createCompose = <K1, K2>(F: Pointed<K1>, G: Pointed<K2>) => {
    class Compose<T> implements Applicative<T, 'Compose'> {
        public static of<A>(value: A): Compose<A> {
            return new Compose(F.of(G.of(value)));
        }
        public readonly kind = 'Compose';
        public readonly name = 'Compose';
        private readonly value: Applicative<Applicative<T, K2>, K1>;
        constructor(value: Applicative<Applicative<T, K2>, K1>) {
            this.value = value;
        }
        public map<A>(fn: (v: T) => A): Compose<A> {
            return new Compose(this.value.map(x => x.map(fn)));
        }
        public ap<A, B>(this: Compose<(v: A) => B>, other: Compose<A>) {
            return this.map(fn => other.map(fn).value);
        }
    }
    return Compose;
};

export default createCompose;
