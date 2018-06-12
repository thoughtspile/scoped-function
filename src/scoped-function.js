'use strict';

function noconflictVarName(name, exclude) {
  while (exclude.some(el => ('' + el).indexOf(name) !== -1)) {
    name += '_';
  }
  return name;
}

function ScopedFunction() {
  // parse arguments
  const scopeRef = arguments[arguments.length - 1];
  const body = arguments[arguments.length - 2];
  const formalArguments = [];
  for (let i = 0; i < arguments.length - 2; i++) {
    formalArguments.push(arguments[i]);
  }
  const formalArgumentStr = '' + formalArguments;

  // protect against scope mutations
  const scopeNames = Object.getOwnPropertyNames(scopeRef);
  const scope = scopeNames.reduce((acc, k) => {
    acc[k] = scopeRef[k];
    return acc;
  }, {});

  // expand scope inside body
  const scopeVarName = noconflictVarName('_scope', [formalArgumentStr, scopeNames, body]);

  // minification-safe injection
  return new Function(scopeVarName, `
    ${scopeNames.map(v => `var ${v} = ${scopeVarName}['${v}'];`).join('\n')}
    return function anonymous(${formalArgumentStr}) {
      ${body}
    };`)(scope);
}

module.exports = ScopedFunction;
