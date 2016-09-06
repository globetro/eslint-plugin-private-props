/**
 * @fileoverview Rule to disallow unused private methods and properties in ES6 class
 * @author Warren Ouyang
 */

'use strict';

var Privates = require('../privates');

module.exports = {
  meta: {
    docs: {
      description: 'disallow unused and undeclared private methods and properties',
      category: 'Possible Errors',
      recommended: true
    },
    schema: [{
      'type': 'object',
      'properties': {
        'privateMethodMatchers': {
          'type': 'array',
          'items': { 'type': 'string' }
        },
        'privatePropertyMatchers': {
          'type': 'array',
          'items': { 'type': 'string' }
        }
      },
      'additionalProperties': false
    }]
  },

  create: function(context) {
    var config = context.options[0] || {};

    var privates = new Privates({
      privatePropertyMatchers: config.privatePropertyMatchers,
      privateMethodMatchers: config.privateMethodMatchers
    });

    return {
      ClassDeclaration() {
        privates.startProcessing();
      },

      ClassProperty(node) {
        privates.processClassProperty(node);
      },

      MethodDefinition(node) {
        privates.processMethodDefinition(node);
      },

      CallExpression(expression) {
        privates.processCallExpression(expression);
      },

      AssignmentExpression(expression) {
        privates.processAssignmentExpression(expression);
      },

      VariableDeclarator(declarator) {
        privates.processVariableDeclarator(declarator);
      },

      'ClassDeclaration:exit'() {
        privates.stopProcessing(context);
      }
    };
  }
};