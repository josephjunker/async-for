# async-for
Builds a function which lets asynchronous functions run with a for loop like syntax
Doesn't create any new functions on each run

The asynchronous equivalent of for (var i = 0; i < 10; i++) { someCode (); } is
```javascript
var loop = asyncFor () (0; function (i) { return i < 10; }; function (i) { return i + 1; }, someCode);
loop (callback);
```

If the loop is expected to count from zero to a finishing number by one each step, everything but the limit and function body may be omitted:
```javascript
var loop = asyncFor () (10, someCode);
loop (callback);
```

The wrapped function is passed (i, _break, _continue, data)
return void _break () will end looping
return void _continue () will move to the next iteration

To avoid the need for closures, data may be passed in to the created function before execution
```javascript
var loop = asyncFor () (10, someCode);
loop.load ({ sampleData: 'to operate on' });
loop (callback);
```

A callback may also be specified in advance
```javascript
var loop = asyncFor () (10, someCode);
loop.callback (someFunction);
loop ();
```

Calling the created function twice without specifying a new callback will result in an error being thrown, unless reset () is called
```javascript
var loop = asyncFor () (10, someCode);
loop.callback (someFunction);
// Invalid
loop ();
loop ();

// Valid
loop ();
loop.reset ();
loop ();
```

load, callback and reset are chainable
```javascript
asyncFor () (10, someCode).callback (someFunction). reset ().load ({ sample: 'data' })();
```

