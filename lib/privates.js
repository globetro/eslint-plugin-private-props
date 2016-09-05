/* Processes AST nodes for private method/property declarations and usages */
var _ = require('lodash');
var Messages = require('./messages');

const defaultPrivatePropertyPrefixes = [/^_/];
const defaultPrivateMethodPrefixes = [/^_/, /^handle[A-Z]/];

var Privates = function(opts) {
  opts = opts || {};

  this.privatePropertyPrefixes = opts.privatePropertyPrefixes || defaultPrivatePropertyPrefixes;
  this.privateMethodPrefixes   = opts.privateMethodPrefixes || defaultPrivateMethodPrefixes;

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
          this._addPropertyDeclaredIfPrivate(name, property);
        }
        else if (value.type === 'FunctionExpression') {
          this._addMethodDeclaredIfPrivate(name, property);
        }
      }
    });
  },

  processClassProperty: function(node) {
    if (!this.isProcessing) {
      return;
    }

    if (!node.static) {
      this._addPropertyDeclaredIfPrivate(node.key.name, node);
    }   
  },

  processMethodDefinition: function(node) {
    if (!this.isProcessing) {
      return;
    }

    this._addMethodDeclaredIfPrivate(node.key.name, node);
  },

  processCallExpression: function(expression) {
    if (!this.isProcessing) {
      return;
    }

    var callee = expression.callee;
    if (this._isThisMemberExpression(callee)) {
      this._addUsedIfPrivate(callee.property.name, expression.callee);
    }

    var args = expression.arguments;
    _.each(args, (arg) => {
      if (this._isThisMemberExpression(arg)) {
        this._addUsedIfPrivate(arg.property.name, arg);
      }
    });
  },

  processAssignmentExpression: function(expression) {
    var left = expression.left;
    if (this._isThisMemberExpression(left)) {
      this._addPropertyDeclaredIfPrivate(left.property.name, expression);
    }
    
    var right = expression.right;
    if (this._isThisMemberExpression(right)) {
      this._addUsedIfPrivate(right.property.name, expression.right);
    }
  },

  processVariableDeclarator: function(declarator) {
    var init = declarator.init;
    if (this._isThisMemberExpression(init)) {
      this._addUsedIfPrivate(init.property.name, declarator);
    }
  },

  _reportErrors: function(context) {
    var declaredNames = _.keys(this.privateDeclared);
    var usedNames     = _.keys(this.privateUsed);

    var undeclared = _.difference(usedNames, declaredNames);
    var unused     = _.difference(declaredNames, usedNames);

    _.each(undeclared, (name) => {
      context.report(this.privateUsed[name], Messages.UNDECLARED);
    });

    _.each(unused, (name) => {
      context.report(this.privateDeclared[name], Messages.UNUSED);
    });
  },

  _addPropertyDeclaredIfPrivate: function(name, node) {
    if (this._isPrivateProperty(name)) {
      this.privateDeclared[name] = node;
    }    
  },

  _addMethodDeclaredIfPrivate: function(name, node) {
    if (this._isPrivateMethod(name)) {
      this.privateDeclared[name] = node;
    }    
  },

  _addUsedIfPrivate: function(name, node) {
    if (this._isPrivateProperty(name) || this._isPrivateMethod(name)) {
      this.privateUsed[name] = node;
    }
  },

  _isThisMemberExpression: function(expression) {
    return Boolean(expression && expression.object && expression.object.type === 'ThisExpression');
  },

  _isPrivateProperty: function(name) {
    return _.some(this.privatePropertyPrefixes, (prefix) => prefix.test(name));
  },

  _isPrivateMethod: function(name) {
    return _.some(this.privateMethodPrefixes, (prefix) => prefix.test(name));
  }
};

module.exports = Privates;