var _for = require ('../index');
var should = require ('should');

describe ('loop methods', function () {

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
