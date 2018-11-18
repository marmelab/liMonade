export default interface Applicative<T> {
    readonly value: T;
    map<A>(fn: (value: T) => A): Applicative<A>;
    ap<A, B>(v: Applicative<A>): Applicative<B>;
}
