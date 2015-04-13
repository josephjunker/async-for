var _for = require ('./index');
var should = require ('should');

describe ('asyncFor', function () {

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

  describe ('using two arguments', function () {

    it ('should break without doing anything if given zero', function (done) {
      _for (0, function (i, _break, _continue) {
          throw 'should not have run';
        }) (done);
    });

    it ('should end when the specified count is reached', function (done) {
      var last = -1;
      function assert (num) {
        last++;
        last.should.eql (num);
      }

      _for (10, function (i, _break, _continue) {
          last.should.not.eql (10);
          assert (i);
          setImmediate (_continue);
        }) (function () {
          last.should.eql (9);
          done ();
        });
    });

  });

  describe ('fluent syntax', function () {

    it ('should allow a callback to be preloaded', function (done) {
      func = _for (10, function (i, _break, _continue) {
          _continue ();
        });

      func.callback (done);
      func ();
    });

    it ('should allow new data to be loaded', function (done) {
      var expected = 'a';
      var callCount = 0;
      function assert (value) {
        value.should.eql(expected);
        callCount++;
      }

      func = _for (10, function (i, _break, _continue, data) {
          assert (data);
          _continue ();
        });

      func.load  ('a');
      func (function () {
        expected = 'b';
        func.load ('b');
        func (function () {
          callCount.should.eql (20);
          done ();
        });
      });
    });

    it ('should allow a callback to be reused using reset', function (done) {
      var callCount = 0;
      func = _for (10, function (i, _break, _continue) {
          callCount++;
          _continue ();
        });

      var actions = [
        function () { func.reset (); func (); },
        function () {
          callCount.should.eql (20);
          done();
        }
      ];

      function nextAction () {
        actions.shift ()();
      }

      func.callback ( nextAction );
      func ();

    });

    it ('should be chainable', function (done) {
      func = _for (10, function (i, _break, _continue, data) {
          data.should.eql ('expected');
          _continue ();
        });
      func.callback (function () { done (); }).reset ().load ('expected');
      func ();
    });

  });

  describe ('tests that should throw', function (done) {

    it ('should throw an error if the same callback is used twice', function (done) {
      var loop = _for (10, function (i, _break, _continue, _data) {
          _continue ();
        });

      loop.callback (function () {});

      var runTwice = function () {
        loop ();
        loop ();
      }

      should.throws (runTwice);
      done();
    });

    it ('should throw an error if missing a callback', function (done) {
      var loop = _for (10, function (i, _break, _continue, _data) {
          if (i === 10) throw 'ran too far';
          _continue ();
        });

      should.throws (loop);
      done ();
    });

    it ('should throw an error if _break is called twice in one body function', function (done) {
      var loop = _for (10, function (i, _break, _continue, _data) {
        _break ();
        _break ();
        });

      var callbackCount = 0;
      loop.callback (function () {
        callbackCount++;
      });

      should.throws (loop, /continued iterating/);
      callbackCount.should.eql (1);
      done ();
    });

    it ('should throw an error if _continue and _break are both called in one iteration', function (done) {
      var loop = _for (10, function (i, _break, _continue, _data) {
        _continue ();
        _break ();
        });

      var callbackCount = 0;
      loop.callback (function () {
        callbackCount++;
      });

      should.throws (loop, /continued iterating/);
      callbackCount.should.eql (1);
      done ();
    });

    it ('should throw an error if _break and _continue are both called in one iteration', function (done) {
      var loop = _for (10, function (i, _break, _continue, _data) {
        _break ();
        _continue ();
        });

      var callbackCount = 0;
      loop.callback (function () {
        callbackCount++;
      });

      should.throws (loop, /continued iterating/);
      callbackCount.should.eql (1);
      done ();
    });

  });
  
});
