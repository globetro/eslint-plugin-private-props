/**
 * @fileoverview Rule to disallow unused private methods and properties in ES6 class
 * @author Warren Ouyang
 */

'use strict';

var Privates = require('../privates');

var privates = new Privates();

module.exports = {
  meta: {
    docs: {
      description: 'disallow unused and undeclared private methods and properties',
      category: 'Possible Errors',
      recommended: true
    },
    schema: [] // no options
  },

  create: function(context) {
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