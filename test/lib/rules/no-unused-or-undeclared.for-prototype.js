'use strict';

var rule = require('../../../lib/rules/no-unused-or-undeclared');
var Messages = require('../../../lib/messages');
var RuleTester = require('eslint').RuleTester;

require('babel-eslint');

RuleTester.setDefaultConfig({
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module'
  }
});


var ruleTester = new RuleTester();
ruleTester.run('no-unused-or-undeclared', rule, {

  valid: [
    `
      var Foo = function() {

      };
      Foo.prototype = {
        _test: function() {},

        useTest: function() {
          this._test();
        }
      }
    `
  ],

  invalid: [
    {
      code: `
        var Foo = function() {
        };
        Foo.prototype = {
          _test: function() {}
        }
      `,
      errors: [{
        message: Messages.get(Messages.UNUSED, '_test'),
        type: 'Property'
      }]
    }
  ]
});
