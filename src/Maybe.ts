import { Applicative, Monad, Traversable } from './types';

type nothing = undefined | null;

const isNothing = (value: any): value is nothing => {
    return value === null || typeof value === 'undefined';
};

export class Just<T>
    implements Traversable<T, 'Maybe', 'Just'>, Monad<T, 'Maybe', 'Just'> {
    public static of<A>(value: A): Just<A> {
        return new Just(value);
    }
    public readonly value: T;
    public readonly kind: 'Maybe';
    public readonly name: 'Just';
    constructor(value: T) {
        this.value = value;
    }
    public isNothing(): this is Just<T & nothing> {
        return this.value === null || typeof this.value === 'undefined';
    }
    public isJust(): this is Applicative<NonNullable<T>, 'Maybe', 'Just'> {
        return this.value !== null && typeof this.value !== 'undefined';
    }
    public map<A>(fn: (v: T) => A): Just<A>;
    public map<A>(fn: (v: T) => nothing): Nothing;
    public map<A>(fn: ((v: T) => A) | ((v: T) => nothing)): Just<A> | Nothing {
        const newValue = fn(this.value);
        return isNothing(newValue) ? new Nothing() : new Just(newValue);
    }
    public flatten(): T {
        return this.value;
    }
    public chain<A>(this: Just<NonNullable<T>>, fn: (v: T) => Just<A>): Just<A>;
    public chain<A>(this: Just<NonNullable<T>>, fn: (v: T) => Nothing): Nothing;
    public chain<A>(
        this: Just<T>,
        fn: (v: T) => Nothing | Just<NonNullable<A>>,
    ): Nothing;
    public chain<A>(fn: (v: T) => Just<A> | Nothing): Just<A> | Nothing {
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
    public getOrElse<A>(this: Just<T>, value: A): T;
    public getOrElse<A>(this: Just<T>, {}): A | T {
        return this.value;
    }
    public traverse<A, N, K>(
        {},
        fn: (v: T) => Applicative<A, N, K>,
    ): Applicative<Just<A>, N, K> {
        return fn(this.value).map<Just<A>>(Just.of);
    }
    public sequence<A, N, K>(this: Just<Applicative<A, N, K>>, of: {}) {
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
    public readonly value: never;
    public readonly kind: 'Maybe';
    public readonly name: 'Nothing';
    public isNothing(): this is Nothing {
        return true;
    }
    public isJust(): this is Just<NonNullable<any>> {
        return false;
    }
    public map({}): Nothing {
        return this;
    }
    public flatten(): Nothing {
        return this;
    }
    public chain({}): Nothing {
        return this;
    }
    public ap({}): Nothing {
        return this;
    }
    public traverse<N, K>(
        of: (v: Nothing) => Applicative<Nothing, N, K>,
        {},
    ): Applicative<Nothing, N, K> {
        return of(this);
    }
    public sequence<N, K>(
        of: (v: Nothing) => Applicative<Nothing, N, K>,
    ): Applicative<Nothing, N, K> {
        return this.traverse(of, {});
    }
}
