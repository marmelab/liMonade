import { ComposeType } from './Compose';
import Either, { EitherType } from './Either';
import Identity, { IdentityType } from './Identity';
import IO, { IOType } from './IO';
import List, { ListType } from './List';
import Maybe, { MaybeType } from './Maybe';
import Reader, { ReaderType } from './Reader';
import State, { StateType } from './State';
import Task, { TaskType } from './Task';
import Writer, { WriterType } from './Writer';

export type InferCategory<Value, Name> = Name extends 'Either'
    ? EitherType<Value, 'Right' | 'Left'>
    : Name extends 'Identity'
    ? IdentityType<Value>
    : Name extends 'IO'
    ? IOType<Value>
    : Name extends 'List'
    ? ListType<Value>
    : Name extends 'Maybe'
    ? MaybeType<Value>
    : Name extends 'Reader'
    ? ReaderType<Value, any>
    : Name extends 'State'
    ? StateType<Value, any>
    : Name extends 'Task'
    ? TaskType<Value>
    : Name extends 'Writer'
    ? WriterType<Value>
    : Name extends 'Compose'
    ? ComposeType<Value, any, any>
    : any;

export interface Category<Value, Name> {
    readonly name: Name;
    // We need to have Value used in a Category property for typescript inferrence to work properly
    readonly V: Value;
}

export type Monad =
    | Either
    | Identity
    | IO
    | List
    | Maybe
    | Reader
    | State
    | Task
    | Writer;

export type Functor =
    | Either
    | Identity
    | IO
    | List
    | Maybe
    | Reader
    | State
    | Task
    | Writer;

export type Applicative =
    | Either
    | Identity
    | IO
    | List
    | Maybe
    | Reader
    | State
    | Task
    | Writer;

export type Traversable = Either | Identity | List | Maybe;
