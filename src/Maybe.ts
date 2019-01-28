import { Applicative, Monad, Traversable } from './types';

export type nothing = undefined | null;

export class Maybe<Value>
    implements Traversable<Value, 'Maybe'>, Monad<Value, 'Maybe'> {
    public static of<Value>(value: Value): Maybe<Value> {
        return new Maybe(value);
    }
    public static lift<A, B>(
        fn: (v: A) => B,
    ): (v: A) => Maybe<B> | Maybe<never> {
        return v => new Maybe(fn(v));
    }
    public readonly value: Value;
    public readonly name: 'Maybe';
    constructor(value: Value) {
        this.value = value;
    }
    public isNothing(): this is Maybe<nothing> {
        return this.value === null || typeof this.value === 'undefined';
    }
    public map<A, B>(this: Maybe<A>, fn: (v: A) => B): Maybe<B>;
    public map<A, B>(this: Maybe<nothing>, fn: (v: A) => B): Maybe<nothing>;
    public map<A, B>(
        this: Maybe<A>,
        fn: ((v: A) => B),
    ): Maybe<B> | Maybe<nothing> {
        return this.isNothing() ? this : new Maybe(fn(this.value));
    }
    public flatten(): Value {
        return this.value;
    }
    public chain<A, B>(this: Maybe<A>, fn: (v: A) => Maybe<B>): Maybe<B>;
    public chain<A, B>(
        this: Maybe<nothing>,
        fn: (v: A) => Maybe<B>,
    ): Maybe<nothing>;
    public chain<A, B>(
        this: Maybe<A | nothing>,
        fn: (v: A) => Maybe<B>,
    ): Maybe<B | nothing> {
        return this.isNothing() ? this : this.map(fn).flatten();
    }
    public ap<A, B>(this: Maybe<(v: A) => B>, other: Maybe<A>): Maybe<B>;
    public ap<A, B>(
        this: Maybe<nothing>,
        other: Maybe<A> | Maybe<nothing>,
    ): Maybe<nothing>;
    public ap<A, B>(
        this: Maybe<(v: A) => B> | Maybe<nothing>,
        other: Maybe<nothing>,
    ): Maybe<nothing>;
    public ap<A, B>(
        this: Maybe<(v: A) => B> | Maybe<nothing>,
        other: Maybe<A> | Maybe<nothing>,
    ): Maybe<B> | Maybe<nothing> {
        if (this.isNothing()) {
            return this;
        }

        if (other.isNothing()) {
            return other;
        }
        return this.map(fn => fn(other.flatten()));
    }
    public getOrElse<A>(_: A): Value {
        return this.value;
    }
    public traverse<A, B, N>(
        this: Maybe<A>,
        fn: (v: A) => Applicative<B, N>,
        of: (v: Maybe<nothing>) => Applicative<Maybe<nothing>, N>,
    ): Applicative<Maybe<B>, N>;
    public traverse<A, B, N>(
        this: Maybe<nothing>,
        fn: (v: A) => Applicative<B, N>,
        of: (v: Maybe<nothing>) => Applicative<Maybe<nothing>, N>,
    ): Applicative<Maybe<nothing>, N>;
    public traverse<A, B, N>(
        this: Maybe<A> | Maybe<nothing>,
        fn: (v: A) => Applicative<B, N>,
        of: (v: Maybe<nothing>) => Applicative<Maybe<nothing>, N>,
    ): Applicative<Maybe<B>, N> | Applicative<Maybe<nothing>, N> {
        return this.isNothing() ? of(this) : fn(this.value).map(Maybe.of);
    }
    public sequence<A, N>(
        this: Maybe<Applicative<A, N>>,
        of: (v: any) => any,
    ): Applicative<Maybe<A>, N>;
    public sequence<A, N>(
        this: Maybe<nothing>,
        of: (v: any) => Applicative<any, N>,
    ): Applicative<Maybe<nothing>, N>;
    public sequence<A, N>(
        this: Maybe<Applicative<A, N>> | Maybe<nothing>,
        of: (v: any) => Applicative<Maybe<any>, N>,
    ): Applicative<Maybe<A>, N> | Applicative<Maybe<nothing>, N> {
        return this.traverse((v: any) => v, of);
    }
}

export type MaybeType<Value> = Maybe<Value>;

export default {
    of: Maybe.of,
    list: Maybe.lift,
};
