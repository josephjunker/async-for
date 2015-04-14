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

  it ('should reset loop when load is called', function (done) {
    var counter = 0;
    var firstRun = true;
    func = _for (10, function (i, _break, _continue, data) {
        counter++;
        if (firstRun) {
          data.should.eql ('foo');
        } else {
          data.should.eql ('bar');
          return void _break ();
        }
        _continue ();
      });

    func.load ('foo');
    func (function () {
      firstRun = false;
      func.load ('bar');
      func (function () {
        counter.should.eql (11);
        done ();
      });
    });
  });

  it ('should reuse loaded callback when reset is called', function (done) {

    var counter = 0;
    var firstRun = true;

    func = _for (10, function (i, _break, _continue) {
        counter++;
        if (!firstRun) return void _break ();
        _continue ();
      });

    var cb = function () {
      
      if (firstRun) {

        counter.should.eql (10);
        func.reset();
        firstRun = false;
        func ();

      } else {

        counter.should.eql (11);
        done ();

      }
    };

    func.callback (cb);

    func ();
  });

  it ('should reuse loaded data when reset is called', function (done) {
    var run = 0;
    var count = 0;
    func = _for (10, function (i, _break, _continue, data) {
      count++;
      switch (run) {
        case 0: data.should.eql ('foo');
                return void _continue ();
        case 1: data.should.eql ('foo');
                return void _continue ();
        case 2: data.should.eql ('bar');
                return void _continue ();
      }});

    func.load ('foo');
    func (function () {

      run++;
      func.reset ();
      func (function () {

        run++;
        func.load ('bar');

        func (function () {
          count.should.eql (30);
          done ();
        });
      });
    });
  });

  it ('should let data and callback both be used without interfering with each other', function (done) {

    var firstRun = true;
    var count = 0;

    func = _for (10, function (i, _break, _continue, data) {
      count++;
      if (firstRun) {
        data.should.eql ('foo');
      } else {
        data.should.eql ('bar');
      }
      _continue ();
    });

    var cb = function () {
      if (firstRun) {
        firstRun = false;
        func.load ('bar');
        func ();
      } else {
        count.should.eql (20);
        done ();
      }
    };

    func.load ('foo');
    func.callback (cb);
    func ();
  });
});
