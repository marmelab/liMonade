import { Just, Nothing } from './Maybe';
import { Applicative, Monad, Traversable } from './types';

// TODO: refactor in a single Either class.
export class Right<Value>
    implements
        Traversable<Value, 'Either', 'Right'>,
        Monad<Value, 'Either', 'Right'> {
    public static of<A>(value: A): Right<A> {
        return new Right(value);
    }
    public static lift<A, B>(
        fn: (v: A) => B,
    ): (v: A) => Right<B> | Left<Error> {
        return v => {
            try {
                return new Right(fn(v));
            } catch (error) {
                return new Left(error);
            }
        };
    }
    public kind: 'Either';
    public name: 'Right';
    public readonly value: Value;
    constructor(value: Value) {
        this.value = value;
    }
    public isLeft(): this is Left<Value> {
        return false;
    }
    public isRight(): this is Right<Value> {
        return true;
    }
    public map<A, B>(this: Right<A>, fn: (v: A) => B): Right<B> {
        return new Right(fn(this.value));
    }
    public flatten() {
        return this.value;
    }
    public chain<A>(fn: (v: Value) => Right<A>): Right<A>;
    public chain<A>(fn: (v: Value) => Left<A>): Left<A>;
    public chain<A>(fn: (v: Value) => Right<A> | Left<A>): Right<A> | Left<A> {
        return this.map(fn).flatten();
    }
    public ap<A, B>(this: Right<(v: A) => B>, other: Right<A>): Right<B>;
    public ap<A, B, C>(this: Right<(v: A) => B>, other: Left<C>): Left<C>;
    public ap<A, B, C>(
        this: Right<(v: A) => B>,
        other: Right<A> | Left<C>,
    ): Right<B> | Left<C> {
        if (other.isLeft()) {
            return other;
        }
        return other.map(this.value);
    }
    public catch(_: (v: any) => any): Right<Value> {
        return this;
    }
    public traverse<A, B, K, N>(
        this: Right<A>,
        _: (v: any) => any,
        fn: (v: A) => Applicative<B, K, N>,
    ): Applicative<Right<A>, K, N> {
        return fn(this.value).map(Right.of);
    }
    public sequence<A, K, N>(
        this: Right<Applicative<A, K, N>>,
        of: (v: any) => any,
    ) {
        return this.traverse(of, v => v);
    }
}

export class Left<Value>
    implements
        Traversable<Value, 'Either', 'Left'>,
        Monad<Value, 'Either', 'Left'> {
    public static of<A>(value: A): Left<A> {
        return new Left(value);
    }
    public static lift<A, B>(
        fn: (v: A) => B,
    ): (v: A) => Right<B> | Left<Error> {
        return v => {
            try {
                return new Right(fn(v));
            } catch (error) {
                return new Left(error);
            }
        };
    }
    public kind: 'Either';
    public name: 'Left';
    public readonly value: Value;
    constructor(value: Value) {
        this.value = value;
    }
    public isLeft(): this is Left<Value> {
        return true;
    }
    public isRight(): this is Right<Value> {
        return false;
    }
    public map(_: (v: any) => any): Left<Value> {
        return this;
    }
    public flatten(): Left<Value> {
        return this;
    }
    public chain(_: (v: any) => any): Left<Value> {
        return this;
    }
    public ap(_: any): Left<Value> {
        return this;
    }
    public catch<A>(fn: (v: Value) => A): Right<A> {
        return new Right(fn(this.value));
    }
    public traverse<A, K, N>(
        this: Left<A>,
        of: (v: Left<A>) => Applicative<Left<A>, K, N>,
        _: (v: any) => any,
    ): Applicative<Left<A>, K, N> {
        return of(this);
    }
    public sequence<A, K, N>(
        this: Left<A>,
        of: (v: Left<A>) => Applicative<Left<A>, K, N>,
    ): Applicative<Left<A>, K, N> {
        return of(this);
    }
}

export function eitherToMaybe<A>(either: Right<A>): Just<A>;
export function eitherToMaybe<A>(either: Left<A>): Nothing;
export function eitherToMaybe<A>(
    either: Right<A> | Left<A>,
): Just<A> | Nothing {
    if (either.isRight()) {
        return new Just(either.flatten());
    }

    return new Nothing();
}
