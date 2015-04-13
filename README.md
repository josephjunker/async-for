# async-for
Builds a function which lets asynchronous functions run with a for loop like syntax. For efficiency's sake the created loop will not create new functions while executing, and to prevent silent errors an error will be thrown if a loop's callback is called multiple times. If the loop will be called from multiple async sources simultaneously, a separate loop function must be created for each source. Data may be loaded into the loop without the use of closures, and error information may be returned when the loop breaks.

## A brief example
Here is a contrived loop which uses two synchronous functions:
```javascript
for (var i = 0; i < 10; i++) { 
  var result = doSynchronousComputationForIteration (i);
  if (result.skipIteration) continue;
  if (result.isComplete) break;
  doMoreSynchronousComputation;
}
```

Here is the equivalent loop in which the functions are asynchronous:
```javascript
var _for = require ('asyncFor');

var loop = _for () (0, function (i) { return i < 10; }, function (i) { return i + 1; },
  function loopBody (i, _break, _continue) {
    doAsynchronousComputationForIteration (i, function callback (result) {
      if (result.skipIteration) return void _continue ();
      if (result.isComplete) return void _break ();
      doMoreAsynchronousComputation (_continue);
    });
  }));
  
loop (callbackFunctionGoesHere);
```

## Overview
async-for takes four arguments:
* The initial value of the guard. This may be any type, not just a number. Equivalent to the `var i = 0;` section of a for loop.
* The check clause. This is a function which takes one argument and returns a boolean. At the end of each iteration this function will be passed the current value of the guard. If the function returns false, iteration stops. Equivalent to the `i < max;` section of a for loop.
* The increment clause. This is a function which takes one argument and returns one value. At the end of each iteration the current value of the guard will be passed to this function, and the guard will be set to the return value of this function for the next iteration. Equivalent to the `i++;` section of a for loop
* The loop body. This is a function which takes three arguments: `i`, `_break`, and `_continue`

The wrapped function is passed the arguments `(i, _break, _continue, data)`. To end looping call `return void _break ()`. To move to the next iteration call `return void _continue ()`. `_continue` may be passed as a callback to asynchronous functions in the body. `data` holds whatever was passed to the loop function at invocation time, as described below.

If the loop is expected to count from zero to a finishing number by one each step, everything but the limit and function body may be omitted:
```javascript
var loop = _for (10, loopBodyFunction);
loop (callback);
```

To avoid the need for closures, data may be passed in to the created function before execution via the `.load ()` method on the loop function
```javascript
var loop = _for (10, function body (i, _break, _continue, data) {
  someAsyncFunction (data, _continue);
});
loop.load ({ sampleData: 'to operate on' });
loop (callback);
```

A callback may also be specified in advance via the `.callback ()` function on the loop function
```javascript
var loop = _for (10, loopBodyFunction);
loop.callback (someFunction);
loop ();
```

Calling the created function twice without specifying a new callback will result in an error being thrown. If rerunning the loop with the same callback is desired, the error can be suppressed by explicitly calling the loop function's `.reset ()` method between iterations.
```javascript
var loop = _for (10, loopBodyFunction);
loop.callback (someFunction);
// Invalid
loop ();
loop ();

// Valid
loop ();
loop.reset ();
loop ();
```


Information may be returned from the loop by passing it to `_break`
```javascript
var loop = _for (10, function (i, _break) {
  if (i === 5) return void _break (i);
});

loop (function (returnValue) {
  // returnValue === 5
});
```

The load, callback and reset methods are chainable
```javascript
asyncFor () (10, someCode).callback (someFunction). reset ().load ({ sample: 'data' })();
```

## Limitations
The loop created builds up a call stack, so iterating an extremely large number of times will build up a call stack. Also, while the created loops will throw an error if `_break` is called more than once, or in the same iteration as `_continue`, it is not possible to detect that `_continue` is called twice in the same loop iteration without the use of closures, so this check is omitted.

## License
MIT
