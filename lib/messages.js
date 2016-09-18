var _ = require('lodash');

const MESSAGES = {
  UNDECLARED: "'%s' is undeclared",
  UNUSED: "'%s' is never used"
};

module.exports = _.extend(_.mapValues((MESSAGES), (val, key) => key), {
  get(key /*, arguments */) {
    var str = MESSAGES[key];
    var argsIndex = 1;
    var args = arguments;
    return str.replace(/%s/g, function() {
      return args[argsIndex++];
    });
  }
});