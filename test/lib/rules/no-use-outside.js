'use strict';

var rule = require('../../../lib/rules/no-use-outside');
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
ruleTester.run('no-use-outside', rule, {

  valid: [
    'this._foo()',
    'this._foo = 1',
    'var foo = this._bar'
  ],

  invalid: [
    {
      code: `
        foo._bar();
      `,
      errors: [{
        message: Messages.get(Messages.NO_USE, '_bar'),
        type: 'Identifier'
      }]
    },

    {
      code: `
        foo._bar;
      `,
      errors: [{
        message: Messages.get(Messages.NO_USE, '_bar'),
        type: 'Identifier'
      }]
    },

    {
      code: `
        baz = foo._bar;
      `,
      errors: [{
        message: Messages.get(Messages.NO_USE, '_bar'),
        type: 'Identifier'
      }]
    }
  ]
});
