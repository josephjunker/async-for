var _for = require ('../index');
var should = require ('should');

describe ('named loops', function () {

  it ('should include its name in exceptions', function (done) {
    var loop = _for (10, function (i, _break, _continue, _data) {
      _break ();
      _break ();
      }).setName ('I am a loop');

    var run = function () {
      loop (function () {});
    };

    should.throws (run, /I am a loop/);
    done ();
  });

  it ('should chain with fireAndForget', function (done) {
    var loop = _for (10, function (i, _break, _continue, _data) {
      _break ();
      _break ();
      });

    var run = function () {
      loop
        .setName ('Also a loop')
        .fireAndForget ();
    };

    should.throws (run, /Also a loop/);
    done ();
  });

});
