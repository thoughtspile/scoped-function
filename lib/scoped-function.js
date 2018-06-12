'use strict';

function noconflictVarName(name, exclude) {
  while (exclude.some(function (el) {
    return ('' + el).indexOf(name) !== -1;
  })) {
    name += '_';
  }
  return name;
}

function ScopedFunction() {
  // parse arguments
  var scopeRef = arguments[arguments.length - 1];
  var body = arguments[arguments.length - 2];
  var formalArguments = [];
  for (var i = 0; i < arguments.length - 2; i++) {
    formalArguments.push(arguments[i]);
  }
  var formalArgumentStr = '' + formalArguments;

  // protect against scope mutations
  var scopeNames = Object.getOwnPropertyNames(scopeRef);
  var scope = scopeNames.reduce(function (acc, k) {
    acc[k] = scopeRef[k];
    return acc;
  }, {});

  // expand scope inside body
  var scopeVarName = noconflictVarName('_scope', [formalArgumentStr, scopeNames, body]);

  // minification-safe injection
  return new Function(scopeVarName, '\n    ' + scopeNames.map(function (v) {
    return 'var ' + v + ' = ' + scopeVarName + '[\'' + v + '\'];';
  }).join('\n') + '\n    return function anonymous(' + formalArgumentStr + ') {\n      ' + body + '\n    };')(scope);
}

module.exports = ScopedFunction;