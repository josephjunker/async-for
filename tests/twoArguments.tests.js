var _for = require ('../index');
var should = require ('should');

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
