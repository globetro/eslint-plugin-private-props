'use strict';

var requireIndex = require('requireindex');

// import all rules in lib/rules
module.exports.rules = requireIndex(__dirname + '/rules');
