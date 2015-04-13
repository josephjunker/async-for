var _for = require ('../index');
var should = require ('should');

describe ('given all arguments', function () {

  it ('should break without doing anything if initial test is false', function (done) {
    _for (0, function (i) { return false; }, function (i) { return i + 1; },
      function (i, _break, _continue) {
        throw 'should not have run';
      }) (function () {
        done ();
      });
  });

  it ('calls increment on each iteration', function (done) {
    var last = -1;
    function assert (num) {
      last++;
      num.should.eql (last);
    }

    var loop = _for (0, function (i) { return i < 10; }, function (i) { return i + 1; },
      function (i, _break, _continue) {
        assert (i);
        setImmediate (_continue);
      });

    loop (done);
  });

  it ('should break when _break is called', function (done) {
    var loop = _for (0,
      function (i) { return i < 10; },
      function (i) { return i + 1; },
      function body (i, _break, _continue) {
        if (i === 2) return void _break ();
        i.should.not.eql (3);
        setImmediate (_continue);
      });

    loop (done);
  });

  it ('should let you pass arguments through _break', function (done) {
    var loop = _for (10, function body (i, _break) {
      _break ('foo', 'bar');
    });

    loop (function (foo, bar) {
      foo.should.eql ('foo');
      bar.should.eql ('bar');
      done ();
    });
  });

  it ('should end when the test condition is false', function (done) {
    var loop = _for (0,
      function (i) { return i < 10; },
      function (i) { return i + 1; },
      function (i, _break, _continue) {
        i.should.not.eql (10);
        setImmediate (_continue);
      }) (done);
  });

});
