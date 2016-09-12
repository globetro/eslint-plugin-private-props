/* Processes AST nodes for private method/property declarations and usages */
var _ = require('lodash');
var Messages = require('./messages');

const defaultPrivateMatchers = ['^_', '^handle[A-Z]'];

function compileRegExpStrings(regExpStrings) {
  return _.map(regExpStrings, (str) => new RegExp(str));
}

var Privates = function(opts) {
  opts = opts || {};

  this.privateMatchers = compileRegExpStrings(
    opts.privateMatchers || defaultPrivateMatchers
  );

  this.isProcessing = false;
};

Privates.prototype = {
  startProcessing: function() {
    this.isProcessing    = true;
    this.privateDeclared = {}; // Mapping of name to node
    this.privateUsed     = {}; // Mapping of name to node
  },

  stopProcessing: function(context) {
    this.isProcessing = false;
    this._reportErrors(context);
  },

  processObjectExpression: function(objectExpression) {
    if (!this.isProcessing) {
      return;
    }

    if (!objectExpression || objectExpression.type !== 'ObjectExpression') {
      return;
    }

    _.each(objectExpression.properties, (property) => {
      if (property.type === 'Property') {
        var name = property.key.name;
        var value = property.value;
        if (value.type === 'StringLiteral') {
          this._addDeclaredIfPrivate(name, property);
        }
        else if (value.type === 'FunctionExpression') {
          this._addDeclaredIfPrivate(name, property);
        }
      }
    });
  },

  processClassProperty: function(node) {
    if (!this.isProcessing) {
      return;
    }

    if (!node.static) {
      this._addDeclaredIfPrivate(node.key.name, node);
    }   
  },

  processMethodDefinition: function(node) {
    if (!this.isProcessing) {
      return;
    }

    this._addDeclaredIfPrivate(node.key.name, node);
  },

  processCallExpression: function(expression) {
    if (!this.isProcessing) {
      return;
    }

    var callee = expression.callee;
    if (this._isThisMemberExpression(callee)) {
      this._addUsedIfPrivate(callee.property.name, callee.property);
    }

    var args = expression.arguments;
    _.each(args, (arg) => {
      if (this._isThisMemberExpression(arg)) {
        this._addUsedIfPrivate(arg.property.name, arg.property);
      }
    });
  },

  processAssignmentExpression: function(expression) {
    if (!this.isProcessing) {
      return;
    }

    var left = expression.left;
    if (this._isThisMemberExpression(left)) {
      this._addDeclaredIfPrivate(left.property.name, left.property);
    }
    
    var right = expression.right;
    if (this._isThisMemberExpression(right)) {
      this._addUsedIfPrivate(right.property.name, right.property);
    }
  },

  processVariableDeclarator: function(declarator) {
    if (!this.isProcessing) {
      return;
    }

    var init = declarator.init;
    if (this._isThisMemberExpression(init)) {
      this._addUsedIfPrivate(init.property.name, init.property);
    }
  },

  processJSXExpressionContainer: function(node) {
    if (!this.isProcessing) {
      return;
    }

    if (this._isThisMemberExpression(node.expression)) {
      this._addUsedIfPrivate(node.expression.property.name, node.expression.property);
    }
  },

  _reportErrors: function(context) {
    var declaredNames = _.keys(this.privateDeclared);
    var usedNames     = _.keys(this.privateUsed);

    var undeclared = _.difference(usedNames, declaredNames);
    var unused     = _.difference(declaredNames, usedNames);

    _.each(undeclared, (name) => {
      _.each(this.privateUsed[name], (node) => {
        context.report(node, Messages.get(Messages.UNDECLARED, name));
      });
    });

    _.each(unused, (name) => {
      _.each(this.privateDeclared[name], (node) => {
        context.report(node, Messages.get(Messages.UNUSED, name));
      });
    });
  },

  _addDeclaredIfPrivate: function(name, node) {
    if (this._isPrivateProperty(name)) {
      var declared = this.privateDeclared[name];
      if (!declared) {
        declared = this.privateDeclared[name] = [];
      }
      declared.push(node);
    }    
  },

  _addUsedIfPrivate: function(name, node) {
    if (this._isPrivateProperty(name)) {
      var used = this.privateUsed[name];
      if (!used) {
        used = this.privateUsed[name] = [];
      }
      used.push(node);
    }
  },

  _isThisMemberExpression: function(expression) {
    return Boolean(expression && expression.object && expression.object.type === 'ThisExpression');
  },

  _isPrivateProperty: function(name) {
    return _.some(this.privateMatchers, (prefix) => prefix.test(name));
  }
};

module.exports = Privates;