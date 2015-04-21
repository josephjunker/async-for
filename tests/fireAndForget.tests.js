var _for = require ('../index');

describe ('fire and forget', function () {

  it ('should run without a callback', function () {
    _for (10, function (_break, _continue) {
      _continue ();
    }).fireAndForget ();
  });

});
