/**
 * @fileoverview Rule to disallow unused private methods and properties in ES6 class
 * @author Warren Ouyang
 */

'use strict';

var Privates = require('../privates');

function isReactCreateClass(expression) {
  var callee = expression.callee;

  if (!callee || !callee.object || !callee.property) {
    return false;
  }

  return callee.object.name === 'React' && callee.property.name === 'createClass';
}

function isPrototype(expression) {
  var left = expression.left;
  return left && left.property && left.property.name === 'prototype';
}

module.exports = {
  meta: {
    docs: {
      description: 'disallow unused or undeclared private properties',
      category: 'Possible Errors',
      recommended: true
    },
    schema: [{
      'type': 'object',
      'properties': {
        'privateMatchers': {
          'type': 'array',
          'items': {'type': 'string'}
        }
      },
      'additionalProperties': false
    }]
  },

  create: function(context) {
    var config = context.options[0] || {};

    var privates = new Privates({
      privateMatchers: config.privateMatchers
    });

    return {
      ClassDeclaration() {
        privates.startProcessing();
      },

      CallExpression(expression) {
        if (isReactCreateClass(expression)) {
          privates.startProcessing();
          privates.processObjectExpression((expression.arguments || [])[0]);
        }
      },      

      MemberExpression(expression) {
        privates.processMemberExpression(expression);
      },

      ClassProperty(node) {
        privates.processClassProperty(node);
      },

      MethodDefinition(node) {
        privates.processMethodDefinition(node);
      },

      AssignmentExpression(expression) {
        if (isPrototype(expression)) {
          privates.startProcessing();
          privates.processObjectExpression(expression.right);
        } 
      },

      'ClassDeclaration:exit'() {
        privates.stopProcessing(context);
      },

      'CallExpression:exit'(expression) {
        if (isReactCreateClass(expression)) {
          privates.stopProcessing(context);
        }
      },

      'AssignmentExpression:exit'(expression) {
        if (isPrototype(expression)) {
          privates.stopProcessing(context);
        }
      }
    };
  }
};