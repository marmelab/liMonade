import { Applicative, Monad } from './types';

class IO<Value> implements Applicative<Value, 'IO'>, Monad<Value, 'IO'> {
    public static of<A>(value: A): IO<A> {
        return new IO(() => value);
    }
    public static lift<A, B>(fn: (v: A) => B): (v: A) => IO<B> {
        return v => IO.of(fn(v));
    }
    public readonly name: 'IO';
    public readonly kind: 'IO';
    public readonly computation: () => Value;
    constructor(computation: () => Value) {
        this.computation = computation;
    }
    public map<A, B>(this: IO<A>, fn: (v: A) => B): IO<B> {
        return new IO(() => fn(this.computation()));
    }
    public flatten<A>(this: IO<IO<A>>): IO<A> {
        return new IO(() => this.computation().computation());
    }
    public chain<A, B>(this: IO<A>, fn: ((v: A) => IO<B>)): IO<B> {
        return this.map(fn).flatten();
    }
    public ap<A, B>(this: IO<(v: A) => B>, other: IO<A>): IO<B> {
        return this.chain(fn => other.map(fn));
    }
}

export default IO;
