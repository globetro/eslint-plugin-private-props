'use strict';

var rule = require('../../../lib/rules/for-class');
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
ruleTester.run('for-class', rule, {

  valid: [
    `
      class Foo {

        bar = 'hello';
        _baz = 'bye';

        _bam() {
          var foo = this._baz;
        }

        render() {
          this._bam();
        }
      }
    `
  ],

  invalid: [
    {
      code: `
        class Foo {
          _baz = 'bye';
        }
      `,
      errors: [{
        message: Messages.UNUSED,
        type: 'ClassProperty'
      }]
    },

    {
      code: `
        class Foo {
          _unused() {

          }
        }
      `,
      errors: [{
        message: Messages.UNUSED,
        type: 'MethodDefinition'
      }]
    },

    {
      code: `
        class Foo {
          constructor() {
            this._unused = 1;
          }
        }
      `,
      errors: [{
        message: Messages.UNUSED,
        type: 'AssignmentExpression'
      }]
    },

    {
      code: `
        class Foo {
          render() {
            this._bam();
          }
        }
      `,
      errors: [{
        message: Messages.UNDECLARED,
        type: 'MemberExpression'
      }]
    },

    {
      code: `
        class Foo {
          render() {
            var foo = this._bam;
          }
        }
      `,
      errors: [{
        message: Messages.UNDECLARED,
        type: 'VariableDeclarator'
      }]
    }
  ]
});
