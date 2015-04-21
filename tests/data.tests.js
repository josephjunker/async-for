var _for = require ('../index');
var should = require ('should');

describe ('passing data', function () {

  it ('should call the loop with the passed data', function (done) {
    var results = '';

    var loop = _for (
      0,
      function (i) { return i < 2; },
      function (i) { return i + 1; },
      function (i, _break, _continue, data) {
        results = results + i + data;
        _continue ();
      });

    loop ('a', function () {
      loop ('b', function () {
        loop ('c', function (data) {
          should.not.exist (data);
          results.should.eql('0a1a0b1b0c1c');
          done ();
        });
      });
    });
  });

  it ('should work when making a loop with two arguments', function (done) {
    var results = '';

    var loop = _for (2, function (i, _break, _continue, data) {
      results = results + i + data;
      _continue ();
    });

    loop ('a', function () {
      loop ('b', function () {
        loop ('c', function (data) {
          should.not.exist (data);
          results.should.eql('0a1a0b1b0c1c');
          done ();
        });
      });
    });

  });

});
