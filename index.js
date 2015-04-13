module.exports = function asyncFor (initial, test, increment, func) {
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

  function _break () {
    var tempCallback = callback;
    if (!callback)
      throw new Error ('called an async for loop without a new callback');
    callback = null;
    tempCallback.apply (null, arguments);
  }

  var runIterator = function runIterator (cb) {
    if (cb) callback = cb;
    if (!test (count)) {
      return _break ();
    }

    func (count, _break, _continue, loadedData);
  }

  runIterator.load = function loadForData (data) {
    count = initial;
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
    callback = loadedCallback;
    count = initial;
    return runIterator;
  };

  function _continue () {
    count = increment (count);
    runIterator ();
  }

  return runIterator;
}
