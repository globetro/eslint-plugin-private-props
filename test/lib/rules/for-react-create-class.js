'use strict';

var rule = require('../../../lib/rules/for-react-create-class');
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
ruleTester.run('for-react-create-class', rule, {

  valid: [
    `
      React.createClass({
        foo() {
          this.bar = '123';
        }
      })
    `,

    `
      React.createClass({
        _foo() {
        },

        render() {
          this._foo();
        }
      })
    `,

    `
      React.createClass({
        foo() {
          this._bar = '123';
        },

        render() {
          var foo = this._bar;
        }
      })
    `
  ],

  invalid: [
    {
      code: `
        React.createClass({
          _foo() {
          }
        })
      `,
      errors: [{
        message: Messages.UNUSED,
        type: 'Property'
      }]
    },
    
    {
      code: `
        React.createClass({
          foo: function() {
            this._foo = '123';
          }
        })
      `,
      errors: [{
        message: Messages.UNUSED,
        type: 'AssignmentExpression'
      }]
    },

    {
      code: `
        React.createClass({
          foo: function() {
            this._bar();
          }
        })
      `,
      errors: [{
        message: Messages.UNDECLARED,
        type: 'MemberExpression'
      }]
    },

    {
      code: `
        React.createClass({
          foo: function() {
            var foo = this._bar;
          }
        })
      `,
      errors: [{
        message: Messages.UNDECLARED,
        type: 'VariableDeclarator'
      }]
    }
  ]
});
