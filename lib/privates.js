/* Processes AST nodes for private method/property declarations and usages */
var _              = require('lodash');
var Messages       = require('./messages');
var PrivateMatcher = require('./private-matcher');

var Privates = function(opts) {
  opts = opts || {};

  this.privateMatcher = new PrivateMatcher(opts.privateMatchers);

  this.isProcessing = false;
};

Privates.prototype = {
  startProcessing: function() {
    this.isProcessing    = true;
    this.privateDeclared = {}; // Mapping of name to nodes
    this.privateUsed     = {}; // Mapping of name to nodes
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

  processMemberExpression: function(expression) {
    if (!this.isProcessing) {
      return;
    }

    if (!this._isThisMemberExpression(expression)) {
      return;
    }

    var parent = expression.parent;
    if (parent && parent.type === 'AssignmentExpression' && parent.left === expression) {
      this._addDeclaredIfPrivate(expression.property.name, expression.property);
    }
    else {
      this._addUsedIfPrivate(expression.property.name, expression.property);
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
    return this.privateMatcher.isPrivateProperty(name);
  }
};

module.exports = Privates;