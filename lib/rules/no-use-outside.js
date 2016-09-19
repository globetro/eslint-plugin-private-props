/**
 * @fileoverview Rule to disallow accessing private properties outside of defined object
 * @author Warren Ouyang
 */

'use strict';

var Messages       = require('../messages');
var PrivateMatcher = require('../private-matcher');

module.exports = {
  meta: {
    docs: {
      description: 'disallow use of private properties outside of own object',
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

    var privateMatcher = new PrivateMatcher(config.privateMatchers);

    return {
      MemberExpression(expression) {
        var name = expression.property.name;
        if (privateMatcher.isPrivateProperty(name) && expression.object.type !== 'ThisExpression') {
          context.report(expression.property, Messages.get(Messages.NO_USE, name));
        }
      }
    };
  }
};