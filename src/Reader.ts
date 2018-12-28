import { Applicative, Monad } from './types';

class Reader<T, D> implements Applicative<T, 'Reader'>, Monad<T, 'Reader'> {
    public static of<X>(value: X): Reader<X, any> {
        return new Reader(() => value);
    }
    public static ask<X>(): Reader<X, X> {
        return new Reader(v => v);
    }
    public readonly name: 'Reader';
    public readonly kind: 'Reader';
    public readonly computation: (v: D) => T;
    constructor(computation: (v: D) => T) {
        this.computation = computation;
    }
    public map<A>(fn: (v: T) => A): Reader<A, D> {
        return new Reader((dependencies: D) =>
            fn(this.computation(dependencies)),
        );
    }
    public flatten<A>(this: Reader<Reader<A, D>, D>): Reader<A, D> {
        return new Reader(dependencies =>
            this.computation(dependencies).computation(dependencies),
        );
    }
    public chain<A>(fn: ((v: T) => Reader<A, D>)): Reader<A, D> {
        return this.map(fn).flatten();
    }
    public ap<A, B>(
        this: Reader<(v: A) => B, D>,
        other: Reader<A, D>,
    ): Reader<B, D> {
        return this.chain(fn => other.map(fn));
    }
}

export default Reader;
