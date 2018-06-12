(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['module'], factory);
  } else if (typeof exports !== "undefined") {
    factory(module);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod);
    global.scopedFunction = mod.exports;
  }
})(this, function (module) {
  'use strict';

  function noconflictVarName(name, exclude) {
    while (exclude.some(function (el) {
      return el === name;
    })) {
      name += '_';
    }
    return name;
  }

  function ScopedFunction() {
    // parse arguments
    var scope = arguments[arguments.length - 1];
    var body = arguments[arguments.length - 2];
    var formalArguments = [];
    for (var i = 0; i < arguments.length - 2; i++) {
      formalArguments.push(arguments[i]);
    }
    var formalArgumentStr = '' + formalArguments;

    // protect against scope mutations
    var scopeNames = Object.getOwnPropertyNames(scope);

    // expand scope inside body
    var scopeVarName = noconflictVarName('_scope', scopeNames);

    // minification-safe injection
    return new Function(scopeVarName, '\n    ' + scopeNames.map(function (v) {
      return 'var ' + v + ' = ' + scopeVarName + '[\'' + v + '\'];';
    }).join('\n') + '\n    return function anonymous(' + formalArgumentStr + ') {\n      ' + body + '\n    };')(scope);
  }

  module.exports = ScopedFunction;
});