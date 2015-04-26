# async-for
Builds a function which lets asynchronous functions run with a for loop like syntax. The function does not store state and may be reused from multiple asynchronous computations simultaneously, and can load data for loop invocations without having to create the loop in a closure. The created loops check for a range of error conditions, such as a missing callback or exiting the loop multiple times, and throws descriptive errors in these cases. By default the loop spreads iterations across the event loop using setImmediate() and thus can iterate indefinitely without overflowing the stack.

## Installation
`npm install async-for`

## A brief example
Here is a contrived loop which uses two synchronous functions:
```javascript
for(var i = 0; i < 10; i++) { 
  var result = doSomeSynchronousCoputationHere(i);
  if (result.skipIteration) continue;
  if (result.isComplete) break;
  doMoreSynchronousComputationHere();
}
```

Here is the equivalent loop in which the functions are asynchronous:
```javascript
var _for = require('asyncFor');

var loop = _for(0, function (i) { return i < 10; }, function (i) { return i + 1; },
  function loopBody(i, _break, _continue) {
    doSomeAsynchronousComputationHere(i, function callback (result) {
      if (result.skipIteration) return void _continue();
      if (result.isComplete) return void _break();
      doMorAsynchronousComputationHere(_continue);
    });
  }));
  
loop(callbackFunctionGoesHere);
```

## Overview
async-for takes four arguments:
* The initial value of the iteration variable. This may be any type, not just a number. Equivalent to the `var i = 0;` section of a for loop.
* The check clause. This is a function which takes one argument and returns a boolean. At the end of each iteration this function will be passed the current value of the iteration variable. If the function returns false, iteration stops. Equivalent to the `i < max;` section of a for loop.
* The increment clause. This is a function which takes one argument and returns one value. At the end of each iteration the current value of the iteration variable will be passed to this function, and the iteration variable will be set to the return value of this function for the next iteration. Equivalent to the `i++;` section of a for loop
* The loop body. This is a function which takes three arguments: `i`, `_break`, and `_continue`

The wrapped function is passed the arguments `(i, _break, _continue, data)`. To end looping call `return void _break()`. To move to the next iteration call `return void _continue()`. `_continue` may be passed as a callback to asynchronous functions in the body. `data` holds whatever was passed to the loop function at invocation time, as described below.

If the loop is expected to count from zero to a finishing number by one each step, everything but the limit and function body may be omitted:
```javascript
var loop = _for(10, loopBodyFunction);
//Equivalent to var loop = _for(0, function (i) { return i < 10; }, function (i) { return i + 1; }, loopBodyFunction)

loop(callback);
```

Data may be passed to the loop function along with the callback, and will be provided to every iteration of the loop
```javascript
var loop = _for(10, function body (i, _break, _continue, data) {
  someAsyncFunction(data, _continue);
});

loop({ sampleData: 'to operate on' }, callback);
```

A value may be returned from the loop by passing it to `_break`
```javascript
var loop = _for (10, function (i, _break) {
  if (i === 5) return void _break (i);
});

loop (function (returnValue) {
  // returnValue === 5
});
```
## Asynchronicity
To avoid stack overflows when performing a high number of iterations when given a synchronous loop body, iterations are spread across event loop ticks by using `setImmediate()` every time `_continue` is called. If this behavior is not desired, use `var _for = require('async-for').sync;` instead of `var _for = require('async-for');`

## Errors and debugging
To avoid silent errors, created loops will throw errors when cases occur that indicate a programming error, and which could lead to difficult-to-debug behavior. These cases are:
* If both `_break` and `_continue` are called in the same iteration of a loop
* If `_continue` is called multiple times in the same iteration of a loop
* If a loop is invoked without providing a callback or operating in fire-and-forget mode (explained below)
If this behaviour is not desired, loops can be created in unsafe mode by using `var _for = require('async-for').unsafe;` instead of `var _for = require('async-for');`, but this is highly unrecommended.

If a loop should be run without a callback, it can be invoked as so:
```javascript
var loop = _for(10, someBodyFunction);
loop.fireAndForget();
```

For ease of debugging, loops may be given names, which will be included in error messages in the case of an error:
```javascript
var loop = _for(10, someBodyFunction);
var loopWithName = loop.named('Susan');
loopWithName(data, callback);
```

`loop.named('Bob').fireAndForget()` will behave as expected.

## License
MIT
