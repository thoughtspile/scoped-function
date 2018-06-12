'use strict';

function noconflictVarName(name, exclude) {
  while (exclude.some(el => el === name)) {
    name += '_';
  }
  return name;
}

function ScopedFunction() {
  // parse arguments
  const scope = arguments[arguments.length - 1];
  const body = arguments[arguments.length - 2];
  const formalArguments = [];
  for (let i = 0; i < arguments.length - 2; i++) {
    formalArguments.push(arguments[i]);
  }
  const formalArgumentStr = '' + formalArguments;

  // protect against scope mutations
  const scopeNames = Object.getOwnPropertyNames(scope);

  // expand scope inside body
  const scopeVarName = noconflictVarName('_scope', scopeNames);

  // minification-safe injection
  return new Function(scopeVarName, `
    ${scopeNames.map(v => `var ${v} = ${scopeVarName}['${v}'];`).join('\n')}
    return function anonymous(${formalArgumentStr}) {
      ${body}
    };`)(scope);
}

module.exports = ScopedFunction;
