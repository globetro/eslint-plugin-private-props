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
    `,

    `
      class Foo {
        handleThis = () => {
        };

        render() {
          return (
            <div onClick={this.handleThis}/>
          )
        }
      }
    `,
    `
      class Foo {
        render() {
          bar._bam();
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
        message: Messages.get(Messages.UNUSED, '_baz'),
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
        message: Messages.get(Messages.UNUSED, '_unused'),
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
        message: Messages.get(Messages.UNUSED, '_unused'),
        type: 'Identifier'
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
        message: Messages.get(Messages.UNDECLARED, '_bam'),
        type: 'Identifier'
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
        message: Messages.get(Messages.UNDECLARED, '_bam'),
        type: 'Identifier'
      }]
    },

    {
      code: `
        class Foo {
          privRender() {
          }
        }
      `,
      options: [{
        'privateMatchers': ['^priv[A-Z]']
      }],
      errors: [{
        message: Messages.get(Messages.UNUSED, 'privRender'),
        type: 'MethodDefinition'
      }]
    },

    {
      code: `
        class Foo {         
          render() {
            return (
              <div onClick={this.handleThis}/>
            )
          }
        }
      `,
      errors: [{
        message: Messages.get(Messages.UNDECLARED, 'handleThis'),
        type: 'Identifier'
      }]
    }
  ]
});
