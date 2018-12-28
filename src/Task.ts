import { Applicative, Monad } from './types';

class Task<T> implements Applicative<T, 'Task'>, Monad<T, 'Task'> {
    public static of<X>(value: X): Task<X> {
        return new Task((resolve, _) => resolve(value));
    }
    public readonly name: 'Task';
    public readonly kind: 'Task';
    public readonly cps: (
        resolve: (v: T) => void,
        reject: (v: Error) => void,
    ) => void;
    constructor(
        cps: (resolve: (v: T) => void, reject: (v: Error) => void) => void,
    ) {
        this.cps = cps;
    }
    public map<A>(fn: (v: T) => A): Task<A> {
        return new Task((resolve, reject) => {
            return this.cps((value: T) => {
                try {
                    resolve(fn(value));
                } catch (error) {
                    reject(error);
                }
            }, reject);
        });
    }
    public then(resolve: (v: T) => void, reject: (e: Error) => void) {
        return this.cps(resolve, reject);
    }
    public toPromise() {
        return new Promise(this.then.bind(this));
    }
    public catch<A>(fn: (v: Error) => A) {
        return new Task((resolve, {}) =>
            this.cps(resolve, error => resolve(fn(error))),
        );
    }
    public flatten<A>(this: Task<Task<A>>): Task<A> {
        return new Task((resolve, reject) =>
            this.then(task => task.then(resolve, reject), reject),
        );
    }
    public chain<A>(fn: ((v: T) => Task<A>)): Task<A> {
        return this.map(fn).flatten();
    }
    public ap<A, B>(this: Task<(v: A) => B>, other: Task<A>): Task<B> {
        return this.chain(fn => other.map(fn));
    }
}

export default Task;
