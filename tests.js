var _for = require ('./index');

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
        if (last !== num) throw 'wrong number passed';
      }

      _for (0, function (i) { return i < 10; }, function (i) { return i + 1; },
        function (i, _break, _continue) {
          assert (i);
          setImmediate (_continue);
        }) (function () {
          done ();
        });
    });

    it ('should break when _break is called', function (done) {
      _for (0, function (i) { return i < 10; }, function (i) { return i + 1; },
        function (i, _break, _continue) {
          if (i === 2) return void _break ();
          if (i === 3) throw 'should have ended on break';
          setImmediate (_continue);
        }) (function () {
          done ();
        });
    });

    it ('should end when the test condition is false', function (done) {
      _for (0, function (i) { return i < 10; }, function (i) { return i + 1; },
        function (i, _break, _continue) {
          if (i === 10) throw 'ran too far';
          setImmediate (_continue);
        }) (function () {
          done ();
        });
    });

  });

  describe ('using two arguments', function () {

    it ('should break without doing anything if given zero', function (done) {
      _for (0, function (i, _break, _continue) {
          throw 'should not have run';
        }) (function () {
          done ();
        });
    });

    it ('should end when the specified count is reached', function (done) {
      var last = -1;
      function assert (num) {
        last++;
        if (last !== num) throw 'wrong number passed';
      }

      _for (10, function (i, _break, _continue) {
          if (i === 10) throw 'ran past limit';
          assert (i);
          setImmediate (_continue);
        }) (function () {
          if (last !== 9) throw 'ran to wrong limit';
          done ();
        });
    });

  });

  describe ('fluent syntax', function () {

    it ('should allow a callback to be preloaded', function (done) {
      func = _for (10, function (i, _break, _continue) {
          _continue ();
        });

      func.callback (function () { done (); } );
      func ();
    });

    it ('should allow new data to be loaded', function (done) {
      var expected = 'a';
      var callCount = 0;
      function assert (value) {
        if (value !== expected) throw 'wrong data was loaded';
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
          if (callCount !== 20) throw 'count was reset improperly';
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
          if (callCount !== 20) throw 'count was not properly reset';
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
          if (data !== 'expected') throw 'bad data loaded';
          _continue ();
        });
      func.callback (function () { done (); }).reset ().load ('expected');
      func ();
    });

  });

  describe.skip ('tests that should throw', function (done) {
    // Unfortunately it's difficult to assert that a function threw after a chain of callbacks,
    // so these are expected to fail with a thrown error

    it ('should throw an error if the same callback is used twice', function (done) {
      func = _for (10, function (i, _break, _continue, _data) {
          _continue ();
        });

      func.callback (function () {});

      func ();
      func ();
    });

    it ('should throw an error if missing a callback', function (done) {
      var loop = _for (10, function (i, _break, _continue, _data) {
          if (i === 10) throw 'ran too far';
          setImmediate (_continue);
        });

       loop ();
    });

  });

});
