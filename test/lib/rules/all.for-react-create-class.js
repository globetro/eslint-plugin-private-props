'use strict';

var rule = require('../../../lib/rules/all');
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
ruleTester.run('all', rule, {

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
    `,
    `
      React.createClass({         
        handleThis: function() {
        },
        render() {
          return (
            <div onClick={this.handleThis}/>
          )
        }
      })
    `,
    `
      React.createClass({         
        handleThis: function() {
        },
        render() {
          return (
            <div onClick={this.handleThis.bind(this)}/>
          )
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
        message: Messages.get(Messages.UNUSED, '_foo'),
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
        message: Messages.get(Messages.UNUSED, '_foo'),
        type: 'Identifier'
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
        message: Messages.get(Messages.UNDECLARED, '_bar'),
        type: 'Identifier'
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
        message: Messages.get(Messages.UNDECLARED, '_bar'),
        type: 'Identifier'
      }]
    },

    {
      code: `
        React.createClass({         
          render() {
            return (
              <div onClick={this.handleThis}/>
            )
          }
        })
      `,
      errors: [{
        message: Messages.get(Messages.UNDECLARED, 'handleThis'),
        type: 'Identifier'
      }]
    }
  ]
});
