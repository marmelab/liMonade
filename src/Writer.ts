import { Applicative, Monad } from './types';

export default class Writer<Value>
    implements Applicative<Value, 'Writer'>, Monad<Value, 'Writer'> {
    public static of<A>(value: A): Writer<A> {
        return new Writer(value, []);
    }
    public static lift<A, B>(fn: (v: A) => B): (v: A) => Writer<B> {
        return v => Writer.of(fn(v));
    }
    public readonly name: 'Writer';
    public readonly kind: 'Writer';
    private readonly value: Value;
    private readonly log: any[];
    constructor(value: Value, log: any[] = []) {
        this.value = value;
        this.log = log;
    }
    public read() {
        return { value: this.value, log: this.log };
    }
    public readValue() {
        return this.value;
    }
    public readLog() {
        return this.log;
    }
    public map<A, B>(this: Writer<A>, fn: (v: A) => B): Writer<B> {
        return new Writer(fn(this.value), this.log);
    }
    public ap<A, B>(this: Writer<(v: A) => B>, other: Writer<A>): Writer<B> {
        return this.chain((fn: ((v: A) => B) & Value) => other.map(fn));
    }
    public flatten<A>(this: Writer<Writer<A>>): Writer<A> {
        const inner = this.value;
        return new Writer(inner.value, this.log.concat(inner.log));
    }
    public chain<A, B>(this: Writer<A>, fn: (v: A) => Writer<B>): Writer<B> {
        const inner = fn(this.value).read();
        return new Writer(inner.value, this.log.concat(inner.log));
    }
}
