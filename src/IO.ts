import { Applicative, Monad } from './types';

class IO<T> implements Applicative<T, 'IO'>, Monad<T, 'IO'> {
    public static of<X>(value: X): IO<X> {
        return new IO(() => value);
    }
    public static lift<A, B>(fn: (v: A) => B): (v: A) => IO<B> {
        return v => IO.of(fn(v));
    }
    public readonly name: 'IO';
    public readonly kind: 'IO';
    public readonly computation: () => T;
    constructor(computation: () => T) {
        this.computation = computation;
    }
    public map<A>(fn: (v: T) => A): IO<A> {
        return new IO(() => fn(this.computation()));
    }
    public flatten<A>(this: IO<IO<A>>): IO<A> {
        return new IO(() => this.computation().computation());
    }
    public chain<A>(fn: ((v: T) => IO<A>)): IO<A> {
        return this.map(fn).flatten();
    }
    public ap<A, B>(this: IO<(v: A) => B>, other: IO<A>): IO<B> {
        return this.chain(fn => other.map(fn));
    }
}

export default IO;
