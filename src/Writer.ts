import { Applicative, Monad } from './types';

export default class Writer<T>
    implements Applicative<T, 'Writer'>, Monad<T, 'Writer'> {
    public static of<T>(value: T): Writer<T> {
        return new Writer(value, []);
    }
    public static lift<A, B>(fn: (v: A) => B): (v: A) => Writer<B> {
        return v => Writer.of(fn(v));
    }
    public readonly name: 'Writer';
    public readonly kind: 'Writer';
    private readonly value: T;
    private readonly log: any[];
    constructor(value: T, log: any[] = []) {
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
    public map<A>(fn: (v: T) => A): Writer<A> {
        return new Writer(fn(this.value), this.log);
    }
    public ap<A, B>(other: Writer<A>): Writer<B> {
        return this.chain((fn: ((v: A) => B) & T) => other.map(fn));
    }
    public flatten<A>(this: Writer<Writer<A>>): Writer<A> {
        const inner = this.value;
        return new Writer(inner.value, this.log.concat(inner.log));
    }
    public chain<A>(fn: (v: T) => Writer<A>): Writer<A> {
        const inner = fn(this.value).read();
        return new Writer(inner.value, this.log.concat(inner.log));
    }
}
