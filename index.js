/*jslint node: true */
'use strict';

var noop = function () {};

var toStr = Object.prototype.toString;
function isNotFunction (func) {
  return !func || toStr.call (func) !== '[object Function]';
}

var throwError = {
  doubleContinue: function (loopName) {
    throw new Error ('An async for loop called _continue twice during the same iteration. ' +
        'Be sure the loop ' + (loopName || "") + ' calls "return void _continue() rather than just _continue().'); },
  continuedAfterBreak: function (loopName) {
    throw new Error ( 'An async for loop continued iterating after _break was called. ' +
        'Be sure the loop ' + (loopName || "") + ' calls "return void _break()" rather than just "_break()"'); },
  forgotCallback: function (loopName) {
    throw new Error ('Called ' +
        (loopName || 'an async for loop ') +
        'with no callback. Use "' +
        (loopName || 'loop') + '.fireAndForget()" instead of "' +
        (loopName || 'loop') + '()" if this is desired behaviour.'); },
  calledBreakAndContinue: function (loopName) {
    throw new Error (
        'Called both break and continue during an async for loop. Be sure the loop ' +
        (loopName || "") + ' calls "return void _break()" or "return void continue()" rather than just "break()" or "continue()".'); }
};


function getLoopInstance (initial, test, increment, func, enableExceptions, syncMode) {

  function makeLoopState () {
    return {
      count: initial,
      iteration: 0,
      broke: false,
      lastContinueIteration: -1
    };
  }

  function makeContinue (state) {
    var called = false;
    return function _continue () {
      if (enableExceptions && called) throwError.doubleContinue (state.name);
      called = true;
      state.lastContinueIteration = state.iteration;
      state.count = increment (state.count);
      if (syncMode) return void runIterator (state);
      setImmediate (runIterator, state);
    };
  }

  function makeBreak (state) {
    return function _break () {
      if (enableExceptions && state.broke) throwError.continuedAfterBreak (state.name);
      if (enableExceptions && state.lastContinueIteration === state.iteration) throwError.calledBreakAndContinue (state.name);
      state.broke = true;
      if (state.callback) state.callback.apply (null, arguments);
    };
  }

  function makeInitialIterator (name, fireAndForget) {
    var initial = function initialIterator (data, cb) {
      var state = makeLoopState ();

      //Called with just callback, no data
      if (!cb) {
        cb = data;
      } else {
        state.data = data;
      }

      if (!fireAndForget && enableExceptions && isNotFunction (cb)) throwError.forgotCallback (name);

      state.callback = cb;
      state.name = name;
      runIterator (state);
    };

    if (!fireAndForget) initial.fireAndForget = makeInitialIterator (name, true);
    initial.setName = function setLoopName (loopName) {
      return makeInitialIterator (loopName);
    };

    return initial;
  }

  function runIterator (state) {

    if (enableExceptions && state.broke) throwError.continuedAfterBreak (state.name);

    state.iteration++;
    if (!test (state.count)) {
      return makeBreak (state)();
    }

    func (state.count, makeBreak (state), makeContinue (state), state.data);
  }

  return makeInitialIterator ();
}


var defaultIncrement = function (count) { return count + 1; };

function makeAsyncFor (enableExceptions, syncMode) {

  return function (initial, test, increment, func) {
    if (!func) {
      //we got (maxCount, func)
      var max = initial;
      var defaultTest = function (count) { return count < max; };
      return getLoopInstance (0, defaultTest, defaultIncrement, test, enableExceptions, syncMode);
    }

    return getLoopInstance (initial, test, increment, func, enableExceptions, syncMode);
  };
}


var _for = makeAsyncFor (true);
_for.unsafe = makeAsyncFor (false);
_for.sync = makeAsyncFor (true, true);
_for.unsafeSync = makeAsyncFor (false, true);

module.exports = _for;
