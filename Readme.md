A Monad library to make Monad simple.

# Why liMonade ?

Functor! Monad! Applicative! Traversable! What scary words, yet you probably use them every day without even realizing it.
Array with its map method ? yep that's a functor.
The Promise object? you know what? It's a monad.
And the observable from rxjs: One of the most complex monad there is.

This library is me trying to make monad accessible, and easy to use.

# Why should I use this ?

Monad are for modifying value with function without having to worry about context.
That is what the map method do. (For promise it's called then)
Here is an example:

```js
const toUppercase = s => s.toUpperCase();
['hello', 'world'].map(toUpperCase);
// ['HELLO', 'WORLD'];
Promise.resolve('hello world').then(toUpperCase);
// Promise<'HELLO WORLD'>;
```

Here toUppercase is used with multiple values, and with an asynchronous result, and yet it does not have to worry about it. It just take a string and change it to uppercase.

Each Monad are for handling a specific context.
Maybe are for handling null value.
Either for error.
List for multiple value
IO for side effect
Reader for shared dependencies
Writer for log
State for stateful computation
Task for asynchronous operation
Identity for no context at all

# Identity

Identity is the basic Monad, it just apply function nothing less nothing more.
It is a good starting point to familiarize with the concept.

Identity has no real use case, so the example in this section are quite abstract. But do remember other monads works the same way. Better example will be given in the following sections.

Identity is both a Functor (it has a map method), a Monad (it has a chain method) an applicative (ap method) and a traversable (sequence and traverse)

Like all Monad, you create an identity by calling the Identity function, or its of method.

`of` means takes a value and put it in a monad. For promise we call it `resolve`.

```js
const identity = Identity(5);
// is the same as
const identity = Identity.of(5);

// on an identtiy you can retrieve the value with the value property
identity.value // 5

// To change the value you use map
const identity2 = identity.map(v => v * 2);
identity2.value; // 10
// notice that map create a new identity so
identity.value; // 5
// is unchanged
```

## Identity is a functor with a map method

`map` exist on all functor and has the following properties:

- It only changes the value holded by the functor and nothing else

```js
Identity.of(5).map(v => v);
// is equivalent to
Identity.of(5);
```
- It allows to compose function

```js
const toUppercase = v => v.toUppercase();
const split = v => v.split('');
Identity.of('functor').map(uppercase).map(split);
// is the same as
Identity.of('functor').map(v => split(uppercase(v)));
```

So mapping uppercase then split is the same as mapping the composition of uppercase and split hence map compose function.


## Identity is a monad with a chain method

When you begin to use functor extensively, you can endup to need to compose a function that returns an identity.

```js
const doubleId = v => Identity.of(v * 2);

const idOfId = Identity.of(5).map(doubleId);
// And now we have an identity in an identity
id.value; // Identity<5>
id.value.value; // 5
```

Monad with its chain method allows to map such a function while removing the excess monad.

```js
const doubleId = v => Identity.of(v * 2);

const idOf10 = Identity.of(5).chain(doubleId);
idOf10.value; // 10
```

Monad also offer a flatten method for when you already have a monad in a monad and just want to merge them.

```js
Identity.of(Identity.of(5)).flatten(); // Identity<5>
```
## Identity is an applicative functor with an ap method

How do you map a function that take more than a parameter ?
Well you cannot.
But you can map a function that returns a function.
```js
const add = a => b => a + b;
fnId = Identity.of(5).map(add); // Identity<v => 5 + v>
// But now we have an identity holding a function and not a value.
fnId.map(fn => fn(2)); // Identity<7>
// is not really practical
// The ap method to the rescue.
fnId.ap(Identity.of(2)); // Identity<7>
```

The ap method can only be called on an identity holding a function.
It takes another identity holding a value and call the contained function with it.

## Identity is a traversable

Here is a weird one.
Let's say that you end up with an identity holding a List as its value.
No let's say that you'd prefer to have a List of identity.
Traversable allow you to do just that.
Go to the List section for an example with a List of Tasks becoming a Task of a List.

The sequence method just permute the two monads:
```ts
const id = Identity.of(List([1, 2, 3])); // Identity<List<[1, 2, 3]>>
id.sequence(Maybe.of); // List<[Identity<1>, Identity<2>, Identity<3>]>
```

The traverse method first transforms the value to an applicative, then permute.

```js
const stringToList = v => List(v.split(''));
const id = Identity.of('hey')); // Identity<'hey'>
id.traverse(stringToList, List.of); // List<[Identity<h>, Identity<e>, Identity<y>]>
```

See List for a more practical example with a List of asynchronous Task becoming a Task of a list of value.

## Identity can lift

Finally Identity offer a lift function.
lift is an helper that take a function and returns a new function that wraps its result in an Identity.

With lift when you want a function that returns an identity, you can take a normal function then lift it.

```js
const double = v => v * 2;
doubleThatReturnsAnIdentity = Identity.lift(double);

doubleThatReturnsAnIdentity(5); // Identity<10>
```

# Maybe

Maybe is used to hanlde null value. That is, if we have no value, then it won't call the function and so it will keep a null value.
Maybe has the same methods as identity.
Let's say that we want to retrieve value from the localStorage and do computation on it only if it's here.

## Example

```js
const getUser = window.localStorage.getItem('user');
```

If we wanted to compose getUser with other function let's say to decode the json object, the next function down the composition should check if there is a user.
Maybe to the rescue.
First we can lift getUser so that it wrap its return value in a Maybe.
```js
const maybeGetUser = Maybe.lift(getUser)
const maybeAnUser = maybeGetUser().map(JSON.parse);
```

Now let's say that the user maybe has a basket id, and that we want to retrieve the basket with this id, also in the localStorage.

```js
const getBasket = id => window.localStorage(id);
const maybeGetABasket = Maybe.lift(getBasket);
const maybeABasket = maybeAnUser
    .map(user => user.basket)
    .chain(maybeGetABasket)
    .map(JSON.parse);
```

Finally we want to know if we have a basket or not.
We could use `.value` to unwrap it but Maybe offer helper for that :

```js
const basket = maybeABasket.getOrElse('no basket');
// { ...basketObject } || 'no basket'

// or

if(maybeABasket.isNothing()) {
    // we have no value
} else {
    // we have a value
}
```

## Maybe api

- Maybe takes a value and returns a maybe, if the passed value is null or undefined, all operation on the maybe that would change its value will be ignored.

- Maybe.of: same as Maybe

- Maybe.lift: Takes a function and wraps its return value in Maybe
```ts
// Maybe.lift(fn: A => B): (v: A) => Maybe<B>;
const fn = Maybe.lift(v => v * 2);
// is the same as
const fn = v => Maybe.of(v * 2);
```

- maybe.map: Takes a function and applies it to the value if there is one
```ts
// Maybe<A>.map<fn: A => B>: Maybe<B>;
Maybe.of(5).map(v => v * 2);
-> Maybe<10>;
// Maybe<null | undefined>.map(fn: A => B): Maybe<null | undefined>;
Maybe.of(null).map(v => v * 2);
-> Maybe<null>;
```
- maybe.flatten: Given a maybe holding another maybe, will merge the two together.
Do nothing if the maybe holds nothing
```ts
// Maybe<Maybe<A>>.flatten(): Maybe<A>;
Maybe.of(Maybe.of(5)).flatten();
-> Maybe<5>;
// Maybe<null | undefined>.flatten(): Maybe<null | undefined>;
Maybe.of(null).flatten();
-> Maybe<null>;
```
- maybe.chain
```ts
//Maybe<A>.chain(fn: A => Maybe<B>): Maybe<B>;
Maybe.of(5).chain(v => Maybe.of(v * 2));
-> Maybe<10>;
// Maybe<nothing>.chain(fn: A => Maybe<B>): Maybe<nothing>;
Maybe.of(null).chain(v => Maybe.of(v * 2));
-> Maybe<null>;
```
- maybe.ap
```ts
// Maybe<A => B>.ap(other: Maybe<A>): Maybe<B>;
Maybe.of(v => v * 2).ap(Maybe.of(5));
-> Maybe<10>;
// Maybe<nothing>.ap(other: Maybe<A>): Maybe<nothing>;
Maybe.of(null).ap(Maybe.of(5));
-> Maybe<null>;
// Maybe<A => B>.ap(other: Maybe<nothing>): Maybe<nothing>;
Maybe.of(v => v * 2).ap(Maybe.of(null));
-> Maybe<null>;
```
- maybe.sequence: when the maybe holds an applicative, it will swap the maybe with the applicative. When the maybe does not hold anything, it will place it inside an apllicative.
```ts
/**
 * Maybe<Applicative<A>>.sequence(
 *     of: Value => Applicative<Value>,
 * ): Applicative<Maybe<A>>;
 * */
Maybe.of(Identity.of(5)).sequence(Identity.of);
    -> Identity<Maybe<5>>;
/*
 * Maybe<nothing>.sequence<A>(
 *     of: Value => Applicative<Value>,
 * ): Applicative<Maybe<nothing>>;
 * */
Maybe.of(null).sequence(Identity.of);
    -> Identity<Maybe<null>>;
```
- maybe.traverse: map a function returning an applicative and then swap the applicative with the maybe.
If the maybe holds nothing, an Apllicative<Maybe<nothing>> is returned
```ts
/*
 * Maybe<Applicative<A>>.traverse(
 *     fn: A => Applicative<B>,
 *     of: Value => Applicative<Value>,
 * ): Applicative<Maybe<B>>;
 * */
Maybe.of(5).traverse(v => Identity.of(v * 2));
    -> Identity<Maybe<10>>;
/*
 * Maybe<nothing>.traverse(
 *     of: Value => Applicative<Value>,
 *     fn: A => Applicative<B>,
 * ): Applicative<Maybe<nothing>>;
 * */
Maybe.of(null).traverse(v => Identity.of(v * 2));
    -> Identity<Maybe<10>>;
```
- maybe.isNothing: returns true if the maybe holds nothing (null or undefined)

```ts
Maybe<A>.isNothing(): false;
Maybe<nothing>.isNothing(): true;
```

- maybe.isJust: returns true if the maybe holds a value

```ts
Maybe<A>.isJust(): true;
Maybe<nothing>.isJust(): false;
```
- maybe.getOrElse: returns the Maybe value or the given value if the maybe holds nothing.

```ts
Maybe<A>.getOrElse(defaultValue: B): A;
Maybe<nothing>.getOrElse(defaultValue: B): B;
```

# Either

Either is used to handle possible error, if receiving an error it will preserve it, ignoring all operations. If any mapped function would throw an error, the error will be caught and placed in the Either.
When the either holds a value, we say it is right, otherwise it is left.

## Example

Let's say we retrieved an user from localStorage, where it was json encoded.
We then want to parse it using JSON.parse. Problem, if the json is malformed, we will get an error. Also we want to check that the user is valid, with a name, if there is no user we want an error, and if it has no name. we want another error.

```js
const parseJSON = JSON.parse;
parseJSON('I am a user. I swear!'); // Error(Unexpected token I in JSON at position 0)

const validateUser = user => {
    if (!user) {
        throw new Error('Received no user');
    }

    if (typeof user.name !== 'string') {
        throw new Error('Invalid User: Missing name');
    }
}
```

Either to the rescue :

```js
const tryToParseJSON = Either.lift(parseJSON);
const tryToValidateUser = Either.lift(validateUser);

const parseUser = json => tryToParseJSON(json)
    .chain(tryToValidateUser);

parseUser('I am a user. I swear!'); // Either<Error(Error(Unexpected token I in JSON at position 0))>
parseUser(null); // Either<Error(Received no user)>
parseUser({ foo: 'bar' }); // Either<Error(Invalid User: Missing name)>
parseUser({ name: 'john' }); // Either<{ name: 'john' }>
```

Now let's say that we want a default user if parseUser failed. We can then use the catch method.

```js
parseUser(null).catch(error => ({ name: 'anonymous' })); // Either<'anonymous'>
```

`catch` is executed only if the either hold an error, in which case it will transform the error with the given function and return an either holding the new value.

To get the value, we can call get.
get will either return the value, or throw the error.

```js
parseUser(null).get(); // thow Error('Received no user');
parseUser('{ "name": "john" }').get(); // { name: 'john' }
```

## api

- Either take a value and return an either, if the passed value is an error, all operation on the either to change the value will be ignored.
- Either.of: same as Either
- Either.Right: same as Either but accept only non error value. Return a Right Either
- Either.Left: same as Either but accept only error value. Return a Left Either
- Either.lift: Takes a function and wraps its return value in a Right Either. If it throws an error, it will be wrapped in a left Either instead.
```ts
// Either.lift(fn: A => B): (v: A) => Either<B>;
Either.lift(v => v * 2);
    -> v => Either.of(v * 2);
// Either.lift(fn: A => throw Error): (v: A) => Either<Error>;
Either.lift(v => throw new Error('Boom'));
    -> v => Either.of(new Error('Boom'));
```

- either.map: Take a function and apply it to the value if it's not an error. If the function throw an error a Left Either of the error is returned
```ts
// Either<A>.map(fn: A => B): Either<B>;
Either.of(5).map(v => v * 2);
-> Either<10>;

// Either<Error>.map(fn: A => B): Either<Error>;
Either.of(new Error('Boom')).map(v => v * 2);
-> Either<new Error('Boom')>;
```

- either.flatten: Given the either holds another either, flatten will merge the two together. If the either holds an error it does nothing.
```ts
// Either<Either<A>>.flatten(): Either<A>;
Either.of(Either.of(5)).flatten();
    -> Either<5>
// Either<Error>.flatten(): Either<Error>;
Either.of(new Error('Boom')).flatten();
    -> Either<new Error('Boom')>
```
- either.chain
```ts
// Either<A>.chain<A, B>(fn: A => Either<B>): Either<B>;
Either.of(5).chain(v => Either(v * 2));
    -> Either<10>
// Either<Error>.chain(fn: A => Either<B>): Either<Error>;
Either.of(5).chain(v => v.concat('uh'));
    -> Either<Error('v.concat is not a function')>
```
- either.ap
```ts
// Either<A => B>.ap(other: Either<A>): Either<B>;
Either.of(v => v * 2).ap(Either.of(5));
    -> Either<10>
// Either<Error>.ap(other: Either<A>): Either<Error>;
Either.of(new Error('Boom')).ap(Either.of(5));
    -> Either<new Error('Boom')>
// Either<A => B>.ap(other: Either<Error>): Either<Error>;
Either.of(v => v * 2).ap(Either.of(new Error('Boom')));
    -> Either<new Error('Boom')>
```
- either.sequence: when the either hold an applicative, it will swap the either with the applicative. If the either hold an error it will place the either inside an apllicative.
```ts
/*
 * Either<Applicative<A>>.sequence(
 *     of: Value => Applicative<Value>,
 * ): Applicative<Either<A>>;
 * */
Either.of(Identity.of(5)).sequence(Identity.of);
    -> Identity<Either<5>>
/*
 * Either<Error>.sequence(
 *     of: Value => Applicative<Value>,
 * ): Applicative<Either<Error>>;
 * */
Either.of(new Error('Boom')).sequence(Identity.of);
    -> Identity<Either<new Error('Boom')>>
```
- either.traverse: Is the combination of map followed by sequence. It first modifies the holded value with the given function. The function must returns an applicative. And then it sequence, swapping the either with the applicative.
If the either holds an error, the error will be preserved, and the maybe placed in an applicative (Applicative<Maybe<Error>>)
```ts
/*
 * Either<Applicative<A>>.traverse(
 *     fn: A => Applicative<B>,
 *     of: Value => Applicative<Value>,
 * ): Applicative<Either<B>>;
 * */
Either.of(5).traverse(v => Identity.of(v * 2));
    -> Identity<Either<10>>
/*
 * Either<Error>.sequence(
 *     fn: A => Applicative<B>,
 *     of: Value => Applicative<Value>,
 * ): Applicative<Either<Error>>;
 * */
Either.of(5).traverse(v => throw new Error('Boom'));
    -> Identity<Either<new Error('Boom')>>
```
- maybe.catch: Works like map, it accept a function, and will call it only if the value is an error. It Will transform the Error in a value and returns a Right.
```ts
// Either<A>.catch(fn: Error => B): Either<A>;
Either.of(5).catch(error => error.message);
    -> Either<5>
// Either<Error>.catch(fn: Error => B): Either<B>;
Either.of(new Error('Boom')).catch(error => error.message);
    -> Either<'Boom'>
```
- maybe.isLeft: returns true if the maybe holds an error
```ts
Either<A>.isLeft(): false;
Either<Error>.isLeft(): true;
```
- maybe.isRight: returns true if the maybe holds a value
```ts
Either<A>.isRight(): true;
Either<Error>.isRight(): false;
```
- maybe.get: returns the value or throw the error
```ts
Either<A>.get(): A;
Either<Error>.get(): throw Error;
```

## IO

IO is a shorthand for `Input/Output` IO is used to handle side effects. Instead of holding the value directly, IO holds a function that will return the value. The important distinction compared to the previous monads is that IO is lazy. We can map all we want, nothing will be executed until you call its execute method.
It is useful to handle computations that depends on an external factor. Like user input for example.

### Example

Let's say that we have an input field and an output where we want to display what the user typed, but in uppercase

```html
<input id="input" onInput="displayInput()" />

<p id="output"></p>
```

A side note for previous Monad, the of method was the same as the constructor for other Monad. FOr IO that is not the xcase anymore.
IO take the side effect function that will return the value.
IO.of take a value and wrap it in a function, creating a side effect from it. Sort of.

```js
const inputIO = IO(() => document.getElementById('input').value);
const outputIO = IO.of(
    value => document.getElementById('output').innerText = value
); // notice how outputIO hold a function and not a value
const toUpperCase = v => v.toUpperCase()

const displayInput = outputIO.ap(
    inputIO.map(toUpperCase)
).execute;
```
// TODO add a codepen link once the library is published

### IO api

- IO takes a side effect function and return an IO that will allow to operate on the side effect return value

```ts
// IO(fn: () => Value): IO<Value>
IO(() => 5);
    -> IO<5>
```

- IO.fromSideEffect: Same as IO

- IO.of: take a value and return an IO that will allow to operate on the value

```ts
// IO.of(v: Value): IO<Value>
IO.of(5)
    -> IO<5>
```

- IO.lift: Take a function and wrap its return value in a IO
```ts
// IO.lift(fn: A => B): (v: A) => IO<B>;
IO.lift(v => v * 2);
    -> v => IO.of(v * 2);
```

- io.map: Take a function and apply it to the side effect return value (this is lazy and won't execute the side effect)
```ts
// IO<A>.map(fn: A => B): IO<B>;
const io = IO(() => 5).map(v => v * 2);
    -> IO<10>
```

- io.flatten: If the value is another IO merge the two together. It's lazy.
```ts
// IO<IO<A>>.flatten(): IO<A>;
IO.of(IO.of(5)).flatten();
    -> IO<5>
```

- io.chain
```ts
// IO<A>.chain(fn: A => IO<B>): IO<B>;
IO.of(5).chain(v => IO.of(v * 2));
    -> IO<10>
```

- io.ap
```ts
// IO<A => B>.ap(other: IO<A>): IO<B>;
IO.of(v => v * 2).ap(IO.of(5));
    -> IO<10>
```

- io.execute: trigger the side effect and all the added computation and returns the result
```ts
// IO<A>.execute(): A;
IO(() => 'result').execute();
    -> 'result'
IO.of('result').execute();
    -> 'result'
```

## Task

Task is like Promise. It handle asynchronous task, but with a key difference: like IO it is lazy.
This means that you decide when the Task is executed. You can even execute it several times.

Example:

Let's say we want to be able to fetch but with Task instead of Promise.

```js
const fetchUrl = url => Task((reject, resolve) => {
    fetch(url)
        .then(response => response.json())
        .then(resolve)
        .catch(reject);
});

const getJokeTask = number => Task.of(number)
    .map(value => `https://api.icndb.com/jokes/${value}`)
    .chain(fetchUrl)
    .map(({ value: { joke } }) => joke)
    .map(value => value.toUpperCase())
    .catch(error => 'joke not found');

getJoke42Task = getJoke(42) // nothing is executed yet: Task<?>
// You can either add additional computation or execute it

getJoke42Task.then(console.log, console.log); // let's trigger the task
// "CHUCK NORRIS DOESN'T CHURN BUTTER. HE ROUNDHOUSE KICKS THE COWS AND THE BUTTER COMES STRAIGHT OUT."

getJoke(9999).then(console.log, console.log); // "joke not found"
```

### Task api

- Task takes an asynchronous function and return a Task

```ts
/*
 * Task(
 *     cps: (resolve: Value => void, reject: Error => void) => void,
 * ): Task<Value>
 * */
Task((resolve, reject) => resolve('success'));
    -> Task<'success'>
```

- Task.of: take a value and return a Task that will allow to operate on the value

```ts
// Task.of<Value>(value: Value): Task<Value>
Task.of(5);
    -> Task<5>
```

- Task.reject: takes a value and returns a Task rejected with it. A rejected Task like a left either will ignore all operations on it except catch.

```ts
Task.reject('error').map(v => v * 2);
    -> RejectedTask<'error'>
```

- Task.lift: Takes a function and wrap its return value in a Task
```ts
// Task.lift(fn: A => B): A => Task<B>;
Task.lift(v => v * 2);
    -> v => Task.of(v * 2);
```

- task.map: Takes a function and apply it to the async return value (this is lazy)
```ts
// Task<A>.map(fn: A => B): Task<B>;
Task.of(5).map(v => v * 2);
    -> Task<10>
Task.reject('error').map(v => v * 2);
    -> Task<'error'>
```

- task.catch: Takes a function and apply it to the async error value if there is one. (this is lazy)
```ts
// Task<A>.catch(fn: Error => B): Task<A>;
Task.of(5).catch(v => v * 2);
    ->Task<5>
// RejectedTask<A>.catch(fn: A => B): Task<B>;
Task.reject(5).catch(v => v * 2);
    ->Task<10>
```

- task.flatten: If the value is another Task merge the two together. It's lazy.
```ts
// Task<Task<A>>.flatten(): Task<A>;
Task.of(Task.of(5)).flatten();
    -> Task<5>
// RejectedTask<A>.flatten(): RejectedTask<A>;

Task.reject(5).flatten();
    -> RejectedTask<5>
```

- task.chain
```ts
// Task<A>.chain(fn: A => Task<B>): Task<B>;
Task.of(5).chain(v => Task.of(v * 2));
    -> Task<10>
// RejectedTask<A>.chain(fn: A => Task<B>): RejectedTask<A>;
Task.reject(5).chain(v => Task.of(v * 2));
    -> RejectedTask<5>
```

- task.then: Takes a resolve and a reject callback and call resolve with the async operation result, or reject with the error.
```ts
// Task<Value>.then(resolve: Value => void, reject?: Error => void): void
Task.of(5).then(
    value => // will be called with 5
    error => // will not be called
);

Task.reject(5).then(
    value =>  // will not be called
    error => // will be called with 5
);

```

- task.toPromise convert the task into a promise. This will trigger the asynchronous operation
```ts
// Task<Value>.toPromise(): Promise<Value>
```

## List

List is used to handle multiple value just like Array. It is a Functor like Array, but it is also a Monad, an Applicative Functor and a traversable. You probably frowned upon the sequence and traverse method of the previous monad, but believe me on the List, it is one hell of a powerfull feature.

## Example

To create a List you either call List.of or List.fromArray. List.of take a single value, and List.fromArray, well it takes an array.

Let's say we want to fetch a list of joke from the previous example
```js
const list = List.fromArray([42, 47, 77]);
const listOfTask = list.map(getJoke); // List<[Task<?>, Task<?>, Task<?>]>

// hmm we have a list of Task, not too practical

const taskOfList = listOfTask.sequence(Task.of); // Task<List[?, ?, ?]>>

// Better, and nothing is executed yet.

taskOfList.then((listOfJoke) => {
    listOfJoke.toArray(); // [
    //    'CHUCK NORRIS DOESN'T CHURN BUTTER. HE ROUNDHOUSE KICKS THE COWS AND THE BUTTER COMES STRAIGHT OUT.',
    //    'THERE IS NO THEORY OF EVOLUTION, JUST A LIST OF CREATURES CHUCK NORRIS ALLOWS TO LIVE.',
    //    'CHUCK NORRIS CAN DIVIDE BY ZERO.',
// ]
}), console.log);
```

shorter example using traverse
```js
List.fromArray([42, 47, 77])
    .traverse(getJoke, Task.of)
    .then(listOfJoke => {
        // do something with it
    })

```
@TODO: Add codepen link to prove it works

### List api

- List takes an array of value and return a List

```ts
// List(values: Value[]): List<Value>
List([1, 2, 3]);
    -> List<[1, 2, 3]>
```

- List.of: take a single value and return a List that will allow to operate on this value

```ts
// List.of(value: Value): List<Value>
List.of(5);
    -> List<[5]>
```

- List.lift: Takes a function and wrap its return value in a List
```ts
// List.lift(fn: A => B): A => List<B>;
List.lift(v => v * 2);
    -> v => List.of(v * 2);
```

- list.map: Takes a function and apply it to all the value in the list
```ts
// List<A>.map(fn: A => B): List<B>;
List([1, 2, 3]).map(v => v * 2);
    -> List<[2, 4, 6]>
```

- list.flatten: If the values are other List merge the two together. concatening the values from each list.
```ts
// List<List<A>>.flatten(): List<A>;
List([List([1, 2]), List([3, 4], List([5, 6]))]);
    -> List([1, 2, 3, 4, 5, 6]);
```

- list.chain
```ts
// List<A>.chain<A, B>(fn: A => List<B>): List<B>;
List(['hello', 'world']).chain(v => List(v.split('')));
    -> List(['h', 'e', 'l', 'l', 'o', 'w', 'o', 'r', 'l', 'd'])
```

- list.toArray: convert the list into an array
```ts
// List<A>.toArray(): A[];
List([1, 2, 3]).toArray();
    -> [1, 2, 3]
```

- list.concat: same as Array.concat
```ts
// List<A>.concat(otherList: List<A>): List<A>;
List([1, 2, 3]).concat(4);
    -> List([1, 2, 3, 4])
```

- list.sequence: convert a list of applicative into an applicative of a list.
```ts
/*
 * List<Applicative<A>>.sequence(
 *      of: Value => Applicative<Value>
 * ): Applicative<List<B>>;
 * */
List([Identity.of(1), Identity.of(2), Identity.of(3)]).sequence(Identity.of);
    -> Identity<List<1,2,3>>
```

- list.traverse: like list.sequence, but first take a function transforming the values into Applicative.
```ts
/*
 * List<A>.traverse(
 *     fn: A => Applicative<B>,
 *     of: Value => Applicative<Value>
 * ): Applicative<List<B>>;
 * */
List([1, 2, 3]).traverse(v => Identity.of(v => v * 2));
    -> Identity<List<[2, 4, 6]>>
```


## Reader

The reader monad allow to share value between all composed function. Think of it like dependency injection.
It resemble a lot to IO, but instead of taking a side effect with no argument, it takes a function that take the dependencies as an argument.

## Example

Let's say that we want to retrieve the basket of a user from the browser storage, but we want to be able to change the storage at the time of execution.

```js
const getUser = dependencies => dependencies.storage.getItem('user');
const getBasket = basketId => dependencies => dependencies.storage.getItem(basketId);

const basket = Reader
    .ask() // ask create a reader that return its dependencies as its value
    .map(getUser) // with map you access only the value
    .map(user => user.basket)
    // but with chain you can access the dependencies while initializing the Reader
    .chain(value => Reader(dependencies => getBasket(basketId, dependencies))
    // additionnaly you could have lifted getBasket and use the resulting function
    .execute({ storage: window.localStorage }); // execute the Reader with the given dependencies
```

I did not handle null case for simplicity sake. Here is the same example, but using maybe too

// TODO add codepen link

### Reader api

- Reader takes a function `(v: Dependencies) => Value` and returns a `Reader<Value, Dependencies>`

```ts
/*
 * Reader(
 *     fn: Dependencies => Value,
 * ): Reader<Value, Dependencies>
 * */
const reader = Reader(dependencies => dependencies * 2);
reader.execute(5); // 10
reader.execute(4); // 8
```

- Reader.of: take a single value and return a Reader that will allow to operate on this value

```ts
// Reader.of<Value>(value: Value): Reader<Value, any>;
const reader = Reader.of(5);
    -> Reader<5>
reader.execute('ignored'); // 5
```

- Reader.ask: return a reader where the value is equal to the dependencies

```ts
// Reader.ask(): Reader<Dependencies, Dependencies>;
Reader.ask().execute('gimme back'); // 'gimme back'
```

- Reader.lift: Takes a function returning a function and wrap its return value in a Reader
```ts
// Reader.lift(fn: A => Dependencies => B): A => Reader<B, Dependencies>;
const multiplyReader = Reader.lift(v => multiplicator => v * multiplicator);
    -> v => Reader(multiplicator => v * multiplicator);

multiplyReader(5).execute(2); // 10
```

- list.execute: execute the operation with the given dependencies and return the result

```ts
// Reader<Value, Dependencies>.execute(deps: Dependencies): Value
```

- reader.map: Takes a function and apply it to the reader value. FUnction has no access to the dependencies.
```ts
// Reader<A, Dependencies>.map(fn: A => B): Reader<B, Dependencies>;
const five = Reader.of(5).map(v => v * 2);
    -> Reader<10>
five.execute(5); // 10

const reader = Reader.ask().map(v => v * 2);
    -> Reader<?>
reader.execute(5); // 10
reader.execute(6); // 12
```

- reader.flatten: If the values are other Reader merge the two together.
```ts
// Reader<Reader<A>>.flatten(): Reader<A>;
Reader.of(Reader.of(5)).flatten();
    -> Reader<5>
```

- reader.chain
```ts
// Reader<A>.chain(fn: A => Reader<B>): Reader<B>;
Reader.of(5).chain(v => Reader.of(v * 2));
    -> Reader<10>

const reader = Reader.of(5)
    .chain(v => Reader(dependencies => dependencies(v)));
reader.execute(v => v + 1); // 6
reader.execute(v => v * 2); // 10

```

## Writer

The Writer Monad allows us to handle log while mapping function.
That is you can map function, while adding item to an array.

## Example:

Let's verify an user while adding error log for each bad property

```js
const checkUserName = name => {
    if (typeof name !== 'string') {
        return ['name is required'];
    }
    if (name.length < 5) {
        return ['name must be at least 5 character long'];
    }

    return [];
}

const checkUserPassword = password => {
    if (typeof password !== 'string') {
        return ['password is required'];
    }
    if (password.length < 5) {
        return ['password must be at least 5 character long'];
    }
    if (...) {
        return ['password must contains at least one number'];
    }
    if (...) {
        return ['password must contains at least one special character'];
    }

    return [];
}
const verifyUser = user => Writer.of(user)
    .chain(user => Writer(user, checkUserName(user.name)))
    .chain(user => Writer(user, checkUserPassword(user.password)))
    .getLog

verifyUser({}); // ['name is required', 'password is required']
verifyUser({ name: 'fred', password: 'xxx' }); // ['name must be at least 5 character long', 'password must be at least 5 character long']
```

### Writer api

- Writer takes a Value and an optional array of log (the log can be of any type default to empty array)

```ts
// Writer(value: Value, logs?: []): Writer<Value>
Writer(5);
    -> Writer<5, []>
Writer(5, ['a five']);
    -> Writer<5, ['a five']>
```

- Writer.of: take a single value and return a Writer with empty logs

```ts
// Writer.of(value: Value): Writer<Value>
Writer.of(5);
    -> Writer<5, []>
```

- Writer.lift: Takes a function and logs, and wrap the result of the function in a Writer with the given log.
```ts
/*
 * Writer.lift(
 *     fn: A => B,
 *     logs: Log[] = []
 * ): (v: A) => Writer<B, Log>;
 * */

Writer.lift(v => v * 2, ['doubling the value']>);
    -> v => Writer(v * 2, ['doubling the value']);
```

- writer.map: Takes a function and apply it to the writer value. The logs are untouched.
```ts
// Writer<A>.map(fn: A => B): Writer<B>;
Writer(5, ['start with a five']).map(v => v * 2);
    -> Writer<10, ['start with a five']>
```

- writer.flatten: If the value is another Writer merge the two together. The logs of both writer will be concatened
```ts
// Writer<Reader<A, Log>, Log>.flatten(): Reader<A, Log>;
Writer(Writer(5, ['a five']), ['another writer']).flatten();
    -> Writer<5, ['another writer', 'a five']>
```

- writer.chain: Takes a function returning another writer and return a Writer with the value of the nested Writer, and the logs of both.
```ts
// Writer<A>.chain(fn: A => Writer<B>): Writer<B>;
Writer.of(5, 'a five').chain(v => Writer(v * 2, 'multiply by 2'));
    -> Writer<10, ['a five', 'multiply by 2']>
```

- writer.read: return the contained logs and value;

```ts
// Reader<Value, Log>.read(): { value: Value, log: Log };
Reader(5, ['a five']).read();
    -> { value: 5, log: ['a five'] }
```

- writer.readValue return the value from the reader

```ts
// Reader<Value, Log>.read(): Value;
Reader(5, ['a five']).readValue();
    -> 5
```

- writer.readLog return the log from the reader

```ts
// Reader<Value, Log>.read(): Log;
Reader(5, ['a five']).readLog();
    -> ['a five']
```

## State

The State Monad allows us to realize computation on a value while maintaining a state on the side.

### Example

Let us handle a simple form, we want to be able to update the value, or to revert all the change.

```js
const form = {
    email: 'john@doe.com',
    comment: 'no comment',
};

State.getState()
    .map(form => ({
        ...form,
        comment: 'updated comment',
    }))
    .chain(currentForm => State(oldForm => ({ value: , state: oldForm })))
    .evalState(form);

state.evalState(form);
```
