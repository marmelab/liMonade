import Applicative from './types/Applicative';

export interface Pointed {
    of<T>(v: T): Applicative<T>;
}

// The functor that compose functors.
// It allows to operate on a value nested in two functors `Functor(Functor(value))`.
// Needed to test Traversable law. You will probably never use it.
const createCompose = (F: Pointed, G: Pointed) => {
    class Compose<T> {
        public static of<A>(value: A): Compose<A> {
            return new Compose(F.of(G.of(value)));
        }
        public readonly value: Applicative<Applicative<T>>;
        constructor(value: Applicative<Applicative<T>>) {
            this.value = value;
        }
        public map<A>(fn: (v: T) => A): Compose<A> {
            return new Compose(this.value.map(x => x.map(fn)));
        }
        public ap<A, B>(
            this: Compose<(v: A) => B>,
            other: Applicative<A>,
        ): Compose<B> {
            return this.map(fn => other.map(fn).value);
        }
    }
    return Compose;
};

export default createCompose;
