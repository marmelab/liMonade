A Monad library to make Monad simple.

# Why liMonade

Functor! Monad! Applicative! Traversable! What scary words, yet you probably use them every day without even realizing it.
Array with its map method ? yep that's a functor.
The Promise object? you know what? It's a monad.
And the observable from rxjs: One of the most complex monad there is.

This library is me trying to make monad accessible, and easy to use.

# What is a Functor ?

A functor is an interface for a class that act as a placeholder for values. Like an array object holding several values, a promise representing a future value, or an observable waiting for a stream of values.

This placeholder offer a method that allow to update the represented value with a function. Array and Observable offer the map method, while promise gives us the then method.
Notice that although the value holded are different, the way to use map/then is the same.
And thanks to them we can separate the function from where/when they are called.

```ts
interface Functor<Value> {
    readonly kind: Kind;
    readonly name: Name;
    map<A, B>(
        this: Functor<A, Kind, Name>,
        fn: (value: A) => B,
    ): Functor<B, Kind, Name>;
}
```

# What is a Monad ?

A monad is a functor, that can handle a recurring edge case.
What if we end up with a monad inside a monad ?
Promise do this transparently with its then method. When you map a function returning a Promise, you do not end up with a Promise resolving to another Promise. You have a single Promise, the two promises have been automatically combined.
Others monad have a separate method for this called `chain` sometime `flatMap`. This method work like map except that it take a function returning a monad. It apply the function and take the resulting monad in a monad and flatten it to a single monad.
One important note, you can only chain two monad of the same type. So Promise with Promise, but not Promise with Array.

# What is an Applicative Functor ?

An applicative functor (applicative for short) is a functor that handle another edge case: What if we endup with a Functor holding a function.
It offers a `ap` method that accept a value, and will pass it to the function in the functor, returning a new Functor holding the resulting value.

# What is a Traversable ?

It is an applicative functor that is able to swap two nested Applicative.
So if you had an Array of Promise, you could convert it to a single Promise of an Array.
Granted that the Array implemented the Traversable method.
Traversable offer two methods: traverse and sequence

`traverse` takes a function returning an Applicative and then swap the applicative with the traversable.
`sequence` only swap the traversable with the applicative, this imply that the Traversable already hold an applicative.

liMonad offer several Monad, some of whixh are also Apllicative or even traversable.

The implemented monad are:

- Identity
- Maybe
- Either
- IO
- Task
- Writer
- Reader
- State

# Identity

Identity implements Functor, Monad, Applicative and Traversable.
It is the simplest Monad there is, since it simply hold a value and it's all.
It is useful to demonstate the concept, and for testing other Monads.

# Maybe

Maybe implements Functor, Monad, Applicative and Traversable
It is in fact the combination of two Class Just and Nothing.
Just is the same as Identity.
Nothing is a Monad that hold no value and thus never change.

## How to use Maybe

Maybe is useful whe we have a function that can return a value or null.
Instead of returning the value or not, we return a Maybe. (A Just if there was a value, Nothing otherwise).
This way we can map, knowing that the given function will only get executing it there was a value.
No more need to check for the value every time.

# Either

Either implements Functor, Monad, Applicative and Traversable.
Like Maybe Ether is composed of the Right and Left class.
Right is similar to Identity and Just.
Left hold a value, but will never changes it.

## How to use Either

Either is useful when you have a function that can throw an error.
Instead of throwing we can return a Right if the execution proceeded normally, or a Left holding the error.
This way we can map knowing that the function will only get executed if the function had no error.
Additionally Left and Right offer a `catch` method that allows to convert a left into a right. Thing of it like the catch method on the promise.

# IO

IO implements Functor, Monad and Applicative

IO act as a placeholder for a side effect. It is initialized with a function that will return the IO value when called.
IO is lazy, the function giving the value will not get called until the run method get called.

# Task

Task implements Functor, Monad and Applicative
Task is a lazy promise.

# Writer

Writer implements Functor, Monad and Applicative

Writer hold a value while also holding log on the value

# Reader

Reader implements Functor, Monad and Applicative

Reader hold a value that depends on another value that we do not have yet.

# State

State implements Functor, Monad and Applicative

Writer hold a value and a state and allow toupdate both
