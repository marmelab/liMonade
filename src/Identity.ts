import { Category, InferCategory } from './types';

class Identity<Value> implements Category<Value, 'Identity'> {
    public static of<Value>(value: Value): Identity<Value> {
        return new Identity(value);
    }
    public static lift<A, B>(fn: (v: A) => B): (v: A) => Identity<B> {
        return v => new Identity(fn(v));
    }
    public readonly name = 'Identity';
    public readonly V: Value; // Tag to allow typecript to properly infer Value type
    public readonly value: Value;
    constructor(value: Value) {
        this.value = value;
    }
    public map<A, B>(this: Identity<A>, fn: (v: A) => B): Identity<B> {
        return new Identity(fn(this.value));
    }
    public flatten<A>(this: Identity<Identity<A>>): Identity<A> {
        return new Identity(this.value.value);
    }
    public chain<A>(fn: ((v: Value) => Identity<A>)): Identity<A> {
        return this.map(fn).flatten();
    }
    public ap<A, B>(
        this: Identity<(v: A) => B>,
        other: Identity<A>,
    ): Identity<B> {
        return this.chain(fn => other.map(fn));
    }
    public traverse<A, B, Name>(
        this: Identity<A>,
        fn: (v: A) => Category<B, Name>,
        _: (v: any) => any,
    ): InferCategory<Identity<B>, Name> {
        return (fn(this.value) as InferCategory<B, Name>).map(Identity.of);
    }
    public sequence<A, Name>(
        this: Identity<Category<A, Name>>,
        of: (v: any) => any,
    ): InferCategory<Identity<A>, Name> {
        return this.traverse((v: Category<A, Name>) => v, of);
    }
}

export type IdentityType<Value> = Identity<Value>;

const IdentityExport = <Value>(value: Value) => new Identity(value);
IdentityExport.of = Identity.of;
IdentityExport.lift = Identity.lift;

export default IdentityExport;
