export interface Functor<T, Kind, Name = Kind> {
    readonly value: T;
    readonly kind: Kind;
    readonly name: Name;
    // map({}): Functor<T, Kind, Name>;
    // map<A, Other>(
    //     this: Functor<T, Kind, Name>,
    //     fn: {},
    // ): Applicative<A, Kind, Other>;
    map<A>(
        this: Functor<T, Kind, Name>,
        fn: (value: T) => A,
    ): Applicative<A, Kind, Name>;
}

export interface Applicative<T, Kind, Name = Kind>
    extends Functor<T, Kind, Name> {
    ap<A, B>(v: Applicative<A, Kind, Name>): Applicative<B, Kind, Name>;
}

export interface Monad<T, Kind, Name = Kind> extends Functor<T, Kind, Name> {
    chain<A>(fn: ((v: T) => Monad<A, Kind, Name>)): Monad<A, Kind, Name>;
}

export interface Traversable<T, Kind, Name = Kind>
    extends Applicative<T, Kind, Name> {
    traverse<N, M, A, B>(
        this: Traversable<Applicative<A, N>, Name, Kind>,
        {},
        fn: (v: Applicative<A, N>) => Applicative<B, M>,
    ): Applicative<Traversable<B, Kind, Name>, M>;
    sequence<N, A>(
        this: Traversable<Applicative<A, N>, Name, Kind>,
        {},
    ): Applicative<Traversable<A, Kind, Name>, N>;
}

export default Applicative;
