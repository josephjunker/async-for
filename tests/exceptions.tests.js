var asyncFor = require ('../index');
var unsafeFor = asyncFor.unsafeSync;
var should = require ('should');

function test (safeMode) {
  var _for = safeMode ? asyncFor.sync : unsafeFor;
  var maybe = safeMode ? '' : 'not';
  var mode = safeMode ? ' in safe mode' : ' in unsafe mode';

  describe ('callback safety checks' + mode, function (done) {

    it ('should ' + maybe + ' throw an error if missing a callback', function (done) {
      var loop = _for (10, function (i, _break, _continue, _data) {
          if (i === 10) throw 'ran too far';
          _continue ();
        });

      if (safeMode) {
        should.throws (loop);
      }
      done ();
    });

    it ('should ' + maybe + ' throw an error if _break is called twice in one body function', function (done) {
      var loop = _for (10, function (i, _break, _continue, _data) {
        _break ();
        _break ();
        });

      var callbackCount = 0;

      function run () {
        loop (function () {
          callbackCount++;
        });
      }

      if (safeMode) {
        should.throws (run, /continued iterating/);
        callbackCount.should.eql (1);
        done ();
      } else {
        loop (function () {
          callbackCount++;
          if (!safeMode && callbackCount === 2) done ();
        });
      }
    });

    it ('should ' + maybe + ' throw an error if _continue and _break are both called in one iteration', function (done) {
      var loop = _for (10, function (i, _break, _continue, _data) {
        _continue ();
        _break ();
        });

      var callbackCount = 0;

      function run () {
        loop (function () {
          callbackCount++;
        });
      }

      if (safeMode) {
        should.throws (run, /continued iterating/);
        callbackCount.should.eql (1);
        done ();
      } else {
        loop (function () {
          callbackCount++;
          if (!safeMode && callbackCount === 2) done ();
        });
      }
    });

    it ('should ' + maybe + ' throw an error if _break and _continue are both called in one iteration', function (done) {
      var loop = _for (10, function (i, _break, _continue, _data) {
        _break ();
        _continue ();
        });

      var callbackCount = 0;


      function run () {
        loop (function () {
          callbackCount++;
        });
      }

      if (safeMode) {
        should.throws (run, /continued iterating/);
        callbackCount.should.eql (1);
        done ();
      } else {
        loop (function () {
          callbackCount++;
          if (!safeMode && callbackCount === 2) done ();
        });
      }
    });


    it ('should ' + maybe + ' throw an error when _continue () is called twice', function (done) {
      var loop = _for (10, function (i, _break, _continue) {
        _continue ();
        _continue ();
      });

      function callOnce (func) {
        var called = false;
        return function () {
          if (called) return;
          called = true;
          func ();
        };
      }

      if (safeMode) {
        should.throws (loop.fireAndForget, /_continue twice/);
        done ();
      } else {
        loop (callOnce (done));
      }
    });

  });

}

test (true);
test (false);
