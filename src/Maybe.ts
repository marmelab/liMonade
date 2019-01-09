import { Applicative, Monad, Traversable } from './types';

type nothing = undefined | null;

const isNothing = (value: any): value is nothing => {
    return value === null || typeof value === 'undefined';
};

export class Just<Value>
    implements
        Traversable<Value, 'Maybe', 'Just'>,
        Monad<Value, 'Maybe', 'Just'> {
    public static of<A>(value: A): Just<A> {
        return new Just(value);
    }
    public static lift<A, B>(fn: (v: A) => B): (v: A) => Just<B> | Nothing {
        return v => {
            const value = fn(v);

            if (isNothing(value)) {
                return new Nothing();
            }

            return new Just(value);
        };
    }
    public readonly value: Value;
    public readonly kind: 'Maybe';
    public readonly name: 'Just';
    constructor(value: Value) {
        this.value = value;
    }
    public isNothing(): this is Just<Value & nothing> {
        return this.value === null || typeof this.value === 'undefined';
    }
    public isJust(): this is Applicative<NonNullable<Value>, 'Maybe', 'Just'> {
        return this.value !== null && typeof this.value !== 'undefined';
    }
    public map<A, B>(this: Just<A>, fn: (v: A) => B): Just<B>;
    public map<A, B>(this: Just<A>, fn: (v: A) => nothing): Nothing;
    public map<A, B>(
        this: Just<A>,
        fn: ((v: A) => B) | ((v: A) => nothing),
    ): Just<B> | Nothing {
        const newValue = fn(this.value);
        return isNothing(newValue) ? new Nothing() : new Just(newValue);
    }
    public flatten(): Value {
        return this.value;
    }
    public chain<A, B>(
        this: Just<NonNullable<A>>,
        fn: (v: A) => Just<B>,
    ): Just<B>;
    public chain<A>(this: Just<NonNullable<A>>, fn: (v: A) => Nothing): Nothing;
    public chain<A, B>(
        this: Just<A>,
        fn: (v: A) => Nothing | Just<NonNullable<B>>,
    ): Nothing;
    public chain<A, B>(
        this: Just<A>,
        fn: (v: A) => Just<B> | Nothing,
    ): Just<B> | Nothing {
        return this.map(fn).flatten();
    }
    public ap<A, B>(this: Just<(v: A) => B>, other: Just<A>): Just<B>;
    public ap<A, B>(this: Just<(v: A) => B>, other: Nothing): Nothing;
    public ap<A, B>(
        this: Just<(v: A) => B>,
        other: Just<A> | Nothing,
    ): Just<B> | Nothing {
        return other.isNothing()
            ? new Nothing()
            : this.map(fn => fn(other.flatten()));
    }
    public getOrElse<A>(_: A): Value {
        return this.value;
    }
    public traverse<A, B, N, K>(
        this: Just<A>,
        _: (v: any) => any,
        fn: (v: A) => Applicative<B, N, K>,
    ): Applicative<Just<B>, N, K> {
        return fn(this.value).map(Just.of);
    }
    public sequence<A, N, K>(
        this: Just<Applicative<A, N, K>>,
        of: (v: any) => any,
    ) {
        return this.traverse(of, v => v);
    }
}

export class Nothing
    implements
        Traversable<never, 'Maybe', 'Nothing'>,
        Monad<never, 'Maybe', 'Nothing'> {
    public static of(_?: any) {
        return new Nothing();
    }
    public static lift<A, B>(fn: (v: A) => B): (v: A) => Just<B> | Nothing {
        return v => {
            const value = fn(v);

            if (isNothing(value)) {
                return new Nothing();
            }

            return new Just(value);
        };
    }
    public readonly kind: 'Maybe';
    public readonly name: 'Nothing';
    public isNothing(): this is Nothing {
        return true;
    }
    public isJust(): this is Just<NonNullable<any>> {
        return false;
    }
    public map(_: (v: any) => any): Nothing {
        return this;
    }
    public flatten(): Nothing {
        return this;
    }
    public chain(_: (v: never) => any): Nothing {
        return this;
    }
    public ap(_: any): Nothing {
        return this;
    }
    public traverse<K, N>(
        of: (v: Nothing) => Applicative<Nothing, K, N>,
        _: (v: any) => any,
    ): Applicative<Nothing, K, N> {
        return of(this);
    }
    public sequence<K, N>(
        of: (v: Nothing) => Applicative<Nothing, K, N>,
    ): Applicative<Nothing, K, N> {
        return this.traverse(of, (v: any) => v);
    }
}
