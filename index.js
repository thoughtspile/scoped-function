'use strict';

function noconflictVarName(name, stopNames, body) {
  while (deepContains(stopNames, name) || (body && body.indexOf(name) !== -1)) {
    name += '_';
  }
  return name;
}

function deepContains(nestedArr, str) {
  // typeof array
  if (!nestedArr || !nestedArr.length) {
    return false;
  }
  for (var i = 0; i < nestedArr.length; i++) {
    const el = nestedArr[i];
    if ((nestedArr instanceof Object && deepContains(el, str)) || el === str) {
      return true;
    }
  }
  return false;
}

function ScopedFunction() {
  // parse arguments
  const scopeRef = arguments[arguments.length - 1];
  const body = arguments[arguments.length - 2];
  const formalArguments = [];
  for (let i = 0; i < arguments.length - 2; i++) {
    formalArguments.push(arguments[i]);
  }

  // protect against scope mutations
  const scopeNames = Object.keys(scopeRef).filter(n => !deepContains(formalArguments, n));
  const scope = scopeNames.reduce((acc, k) => {
    acc[k] = scopeRef[k];
    return acc;
  }, {});

  // expand scope inside body
  const scopeVarName = noconflictVarName('__scope__', formalArguments.concat(scopeNames), body);
  const expandScope = scopeNames
    .map(v => `var ${v} = ${scopeVarName}['${v}'];`)
    .join('\n');
  const scopedBody = expandScope + '\n' + body;

  // minification-safe injection
  return new Function(scopeVarName, `
    return function anonymous(${'' + formalArguments}) {
      ${scopedBody}
    };`)(scope);
}

module.exports = ScopedFunction;
