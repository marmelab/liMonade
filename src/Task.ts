import { Category } from './types';

class Task<Value> implements Category<Value, 'Task'> {
    public static of<Value>(value: Value): Task<Value> {
        return new Task((resolve, _) => resolve(value));
    }
    public static reject(error: Error): Task<Error> {
        return new Task((_, reject) => reject(error));
    }
    public static lift<A, B>(fn: (v: A) => B): (v: A) => Task<B> {
        return v => Task.of(fn(v));
    }
    public readonly name: 'Task';
    public readonly cps: (
        resolve: (v: Value) => void,
        reject?: (v: Error) => void,
    ) => void;
    constructor(
        cps: (resolve: (v: Value) => void, reject: (v: Error) => void) => void,
    ) {
        this.cps = cps;
    }
    public map<A, B>(this: Task<A>, fn: (v: A) => B): Task<B> {
        return new Task((resolve, reject) => {
            return this.cps(value => {
                try {
                    resolve(fn(value));
                } catch (error) {
                    reject(error);
                }
            }, reject);
        });
    }
    public then(resolve: (v: Value) => void, reject?: (e: Error) => void) {
        return this.cps(resolve, reject);
    }
    public toPromise() {
        return new Promise(this.then.bind(this));
    }
    public catch<A>(fn: (v: Error) => A) {
        return new Task((resolve, reject) =>
            this.cps(resolve, error => {
                try {
                    return resolve(fn(error));
                } catch (err) {
                    reject(err);
                }
            }),
        );
    }
    public flatten<A>(this: Task<Task<A>>): Task<A> {
        return new Task((resolve, reject) =>
            this.then(task => task.then(resolve, reject), reject),
        );
    }
    public chain<A, B>(this: Task<A>, fn: ((v: A) => Task<B>)): Task<B> {
        return this.map(fn).flatten();
    }
    public ap<A, B>(this: Task<(v: A) => B>, other: Task<A>): Task<B> {
        return this.chain(fn => other.map(fn));
    }
}

export type TaskType<Value> = Task<Value>;

const TaskExport = (
    cps: (resolve: (v: {}) => void, reject: (v: Error) => void) => void,
) => new Task(cps);

TaskExport.of = Task.of;
TaskExport.resolve = Task.of;
TaskExport.reject = Task.reject;
TaskExport.lift = Task.lift;

export default TaskExport;
