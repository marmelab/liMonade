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

- Maybe take a value and return a maybe, if the passed value is null or undefined, all operation on the maybe to change the value will be ignored.
- Maybe.of: same as Maybe
- Maybe.lift: Take a function and wrap its return value in Maybe
```ts
lift<A, B>(fn: (v: A) => B): (v: A): Maybe<B>;
```
- maybe.map: Take a function and apply it to the value if there is one
```ts
map<A, B>(this: Maybe<A>, fn: (value: A) => B): Maybe<B>;
map<A, B>(this: Maybe<nothing>, fn: (value: A) => B): Maybe<nothing>;
```
- maybe.flatten: If the value is another Maybe merge the two together. If there is no value, do nothing.
```ts
flatten<A>(this: Maybe<Maybe<A>>): Maybe<A>;
flatten<A>(this: Maybe<nothing>): Maybe<nothing>;
```
- maybe.chain
```ts
chain<A, B>(this: Maybe<A>, fn: ((v: A) => Maybe<B>)): Maybe<B>;
chain<A, B>(this: Maybe<nothing>, fn: ((v: A) => Maybe<B>)): Maybe<nothing>;
```
- maybe.ap
```ts
ap<A, B>(this: Maybe<(v: A) => B>, v: Maybe<A>): Maybe<B>;
ap<A, B>(this: Maybe<nothing>, v: Maybe<A>): Maybe<nothing>;
ap<A, B>(this: Maybe<(v: A) => B>, v: Maybe<nothing>): Maybe<nothing>;
```
- maybe.sequence: when the maybe hold an applicative, it will swap the maybe with the applicative. If the maybe hold nothing it will place the maybe inside an apllicative.
```ts
sequence<A>(this: Maybe<Applicative<A>>,
        of: (v: Value) => Applicative<Value>,
    ): Applicative<Maybe<A>>;
sequence<A>(
    this: Maybe<nothing>,
    of: (v: Value) => Applicative<Value>,
): Applicative<Maybe<nothing>>;
```
- maybe.traverse: map a function returning an applicative and then swap the applicative with the maybe.
If the maybe hold nothing, an Apllicative<Maybe<nothing>> will be returned
```ts
traverse<A, B>(
    this: Maybe<Applicative<A>>,
    of: (v: Value) => Applicative<Value>,
    fn: (v: A) => Applicative<B>,
): Applicative<Maybe<B>>;
sequence<A, B>(
    this: Maybe<nothing>,
    of: (v: Value) => Applicative<Value>,
    fn: (v: A) => Applicative<B>,
): Applicative<Maybe<nothing>>;
```
- maybe.isNothing: return true if the maybe holds nothing (null or undefined)
- maybe.isJust: return true if the maybe holds a value
- maybe.getOrElse: return the Maybe value or the given value if the maybe hold nothing.

# Either

Either is used to handle possible error, if receiving an error it will preserve it, otherwise it will map normally. If any mapped function would trhow an error, the error will be placed in the Either.
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
- EIther.lift: Take a function and wrap its return value in a Right Either or its thrown error in a left Either
```ts
lift<A, B>(fn: (v: A) => B): (v: A): Either<B> | Either<Error>;
```
- either.map: Take a function and apply it to the value if it's not an error. If the function throw an error a Left Either of the error is returned
```ts
map<A, B>(this: Either<A>, fn: (value: A) => B): Either<B>;
map<A, B>(this: Either<Error>, fn: (value: A) => B): Either<Error>;
```
- either.flatten: If the value is another Either merge the two together. If the value is an Error do nothing.
```ts
flatten<A>(this: Either<Either<A>>): Either<A>;
flatten<A>(this: Either<Error>): Either<Error>;
```
- either.chain
```ts
chain<A, B>(this: Either<A>, fn: ((v: A) => Either<B>)): Either<B>;
chain<A, B>(this: Either<Error>, fn: ((v: A) => Either<B>)): Either<Error>;
```
- either.ap
```ts
ap<A, B>(this: Either<(v: A) => B>, v: Either<A>): Either<B>;
ap<A, B>(this: Either<Error>, v: Either<A>): Either<Error>;
ap<A, B>(this: Either<(v: A) => B>, v: Either<Error>): Either<Error>;
```
- either.sequence: when the either hold an applicative, it will swap the either with the applicative. If the either hold an error it will place the either inside an apllicative.
```ts
sequence<A>(this: Either<Applicative<A>>,
        of: (v: Value) => Applicative<Value>,
    ): Applicative<Either<A>>;
sequence<A>(
    this: Either<Error>,
    of: (v: Value) => Applicative<Value>,
): Applicative<Either<Error>>;
```
- maybe.traverse: map a function returning an applicative and then swap the applicative with the either.
If the either hold an error, an Apllicative<Maybe<Error>> will be returned
```ts
traverse<A, B>(
    this: Either<Applicative<A>>,
    of: (v: Value) => Applicative<Value>,
    fn: (v: A) => Applicative<B>,
): Applicative<Either<B>>;
sequence<A, B>(
    this: Either<Error>,
    of: (v: Value) => Applicative<Value>,
    fn: (v: A) => Applicative<B>,
): Applicative<Either<Error>>;
```
- maybe.catch: works like map, it accept a function, and will call it if the value is an error. It Will transform the Error in a value an return a Right Error.
```ts
catch<A, B>(this: Either<A>, fn: (error: Error) => B): Either<A>;
catch<A, B>(this: Either<Error>, fn: (error: Error) => B): Either<B>;
```
- maybe.isLeft: return true if the maybe holds an error
- maybe.isRight: return true if the maybe holds a value
- maybe.get: return the value or throw the error

## IO

IO is a shorthand for `Input/Output` IO is used to handle side effect. Instead of holding the value directly, we hold a function that will return the value. The important distinction compared to the previous monads is that IO is lazy. We can map all we want, nothing will happen until you call its execute method.
It is useful to handle computation that depends on an external factor. Like user input.

## Example

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

## Writer

The Writer Monad allows us to handle log while mapping function.
That is you can map function, while adding string to an array of log.

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
