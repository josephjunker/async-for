
function createAsyncForGenerator (enableExceptions) {

  return function asyncFor (initial, test, increment, func) {
    if (!func) {
      //we got (maxCount, func)
      var max = initial;
      initial = 0;
      func = test;
      test = function (count) { return count < max; };
      increment = function (count) { return count + 1; };
    }

    var count = initial;
    var callback;
    var loadedData;
    var iteration = 0;
    var broke = false;
    var lastContinueIteration;

    function _break () {
      if (enableExceptions && broke) throw new Error ('An async for loop continued iterating after _break was called');
      if (enableExceptions && lastContinueIteration === iteration) throw new Error ('Called both break and continue during an async for loop');

      if (!callback) {
        if (enableExceptions) throw new Error ('Called an async for loop without a callback');
        return;
      }

      broke = true;
      callback.apply (null, arguments);
    }

    function _continue () {
      lastContinueIteration = iteration;
      count = increment (count);
      runIterator ();
    }

    var runIterator = function runIterator (cb) {
      if (enableExceptions && broke) throw new Error ('An async for loop continued iterating after _break was called');
      iteration++;
      if (cb) callback = cb;
      if (!test (count)) {
        return _break ();
      }

      func (count, _break, _continue, loadedData);
    };

    function clearIterationHistory () {
      count = initial;
      broke = false;
      lastContinueIteration = null;
    }

    runIterator.load = function loadForData (data) {
      clearIterationHistory ();
      loadedData = data;
      return runIterator;
    };

    var loadedCallback;

    runIterator.callback = function setIteratorCallback (cb) {
      callback = cb;
      loadedCallback = cb;
      return runIterator;
    };

    runIterator.reset = function resetIterator () {
      clearIterationHistory ();
      callback = loadedCallback;
      return runIterator;
    };

    return runIterator;
  };

}

var _for = createAsyncForGenerator (true);
_for.unsafe = createAsyncForGenerator (false);

module.exports = _for;
