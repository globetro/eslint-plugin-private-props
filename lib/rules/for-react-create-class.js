/**
 * @fileoverview Rule to disallow unused private methods and properties in React.createClass
 * @author Warren Ouyang
 */

'use strict';

var Privates = require('../privates');

var privates = new Privates();

function isReactCreateClass(expression) {
  var callee = expression.callee;

  if (!callee || !callee.object || !callee.property) {
    return false;
  }

  return callee.object.name === 'React' && callee.property.name === 'createClass';
}

module.exports = {
  meta: {
    docs: {
      description: 'disallow unused and undeclared private methods and properties in React.createClass',
      category: 'Possible Errors',
      recommended: true
    },
    schema: [] // no options
  },

  create: function(context) {
    return {
      CallExpression(expression) {
        if (isReactCreateClass(expression)) {
          privates.startProcessing();
          privates.processObjectExpression((expression.arguments || [])[0]);
        }
        else {
          privates.processCallExpression(expression);
        }
      },

      AssignmentExpression(expression) {
        privates.processAssignmentExpression(expression);
      },

      VariableDeclarator(declarator) {
        privates.processVariableDeclarator(declarator);
      },

      'CallExpression:exit'(expression) {
        if (isReactCreateClass(expression)) {
          privates.stopProcessing(context);
        }
      }
    };
  }
};