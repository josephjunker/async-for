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

function makeSafeContinue (_continue, name) {
  var called = false;
  return function continueWrapped () {
    if (called) throwError.doubleContinue (name);
    called = true;
    _continue ();
  };
}

function getLoopInstance (initial, test, increment, func, enableExceptions, safeMode) {

  var count = initial;
  var callback;
  var loadedData;
  var iteration = 0;
  var broke = false;
  var lastContinueIteration;
  var name = null;

  function _continue () {
    lastContinueIteration = iteration;
    count = increment (count);
    runIterator ();
  }

  function _break () {
    if (enableExceptions && broke) throwError.continuedAfterBreak (name);
    if (enableExceptions && lastContinueIteration === iteration) throwError.calledBreakAndContinue (name);
    broke = true;
    callback.apply (null, arguments);
  }

  var runIteratorInitial = function runIteratorInitial (data, cb) {
    //Called with just callback, no data
    if (!cb) {
      cb = data;
    } else {
      loadedData = data;
    }

    if (enableExceptions && isNotFunction (cb)) throwError.forgotCallback (name);

    callback = cb;

    runIterator ();
  };

  runIteratorInitial.fireAndForget = function fireAndForget (data) {
    loadedData = data;
    callback = noop;
    runIterator ();
  };

  runIteratorInitial.setName = function setLoopName (loopName) {
    name = loopName;
  };

  function runIterator () {

    if (enableExceptions && broke) throwError.continuedAfterBreak (name);

    iteration++;
    if (!test (count)) {
      return _break ();
    }

    if (safeMode) {
      func (count, _break, _continue, loadedData);
    } else {
      func (count, _break, makeSafeContinue (_continue, name), loadedData);
    }
  }

  return runIteratorInitial;
}


var defaultIncrement = function (count) { return count + 1; };

function makeAsyncFor (enableExceptions, safeMode) {

  return function (initial, test, increment, func) {
    if (!func) {
      //we got (maxCount, func)
      var max = initial;
      var defaultTest = function (count) { return count < max; };
      return getLoopInstance (0, defaultTest, defaultIncrement, test, enableExceptions, safeMode);
    }

    return getLoopInstance (initial, test, increment, func, enableExceptions, safeMode);
  };
}


var _for = makeAsyncFor (true, false);
_for.safe = makeAsyncFor (true, true);
_for.unsafe = makeAsyncFor (false, false);

module.exports = _for;
