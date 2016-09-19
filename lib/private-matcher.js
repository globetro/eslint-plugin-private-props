var _ = require('lodash');

const defaultPrivateMatchers = ['^_', '^handle[A-Z]'];

function compileRegExpStrings(regExpStrings) {
  return _.map(regExpStrings, (str) => new RegExp(str));
}

var PrivateMatcher = function(privateMatchers) {
  this.privateMatchers = compileRegExpStrings(privateMatchers || defaultPrivateMatchers);
};

PrivateMatcher.prototype = {
  isPrivateProperty: function(name) {
    return _.some(this.privateMatchers, (prefix) => prefix.test(name));
  }
};

module.exports = PrivateMatcher;