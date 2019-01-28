export interface Functor<Value, Name> {
    readonly name: Name;
    map<A, B>(this: Functor<A, Name>, fn: (value: A) => B): Functor<B, Name>;
}

export interface Monad<Value, Name> extends Functor<Value, Name> {
    map<A, B>(this: Monad<A, Name>, fn: (value: A) => B): Monad<B, Name>;
    chain<A>(fn: ((v: Value) => Monad<A, Name>)): Monad<A, Name>;
}

export interface Applicative<Value, Name> extends Functor<Value, Name> {
    map<A, B>(
        this: Applicative<A, Name>,
        fn: (value: A) => B,
    ): Applicative<B, Name>;
    ap<A, B>(
        this: Applicative<(v: A) => B, Name>,
        v: Applicative<A, Name>,
    ): Applicative<B, Name>;
}

export interface Traversable<Value, Name> extends Applicative<Value, Name> {
    map<A, B>(
        this: Traversable<A, Name>,
        fn: (value: A) => B,
    ): Traversable<B, Name>;
    ap<A, B>(
        this: Traversable<(v: A) => B, Name>,
        v: Traversable<A, Name>,
    ): Traversable<B, Name>;
    traverse<A, B, N>(
        this: Traversable<A, Name>,
        fn: (v: A) => Applicative<B, N>,
        of: (v: Traversable<A, Name>) => Applicative<Traversable<A, Name>, N>,
    ): Applicative<Traversable<A, Name>, N>;
    sequence<A, N>(
        this: Traversable<Applicative<A, N>, Name>,
        of: (v: Traversable<A, Name>) => Applicative<Traversable<A, Name>, N>,
    ): Applicative<Traversable<A, Name>, N>;
}
