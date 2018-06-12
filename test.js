const assert = require('assert');
const ScopedFunction = require('./lib/scoped-function.js');


const N_TRIAL = 100000000;
const fBaseline = function (x, y) { return Math.sin(x) + Math.cos(y); };
const f = ScopedFunction('x', 'y', 'return sin(x) + cos(y)', { sin: Math.sin, cos: Math.cos });


console.log('Unit tests...');
assert(typeof ScopedFunction({}) === 'function', 'typeof OK');
assert(ScopedFunction({}) instanceof Function, 'instanceof Function');

assert(ScopedFunction('return sin', Math)() === Math.sin, 'expands non-enumerable properties');
assert(f(1, 2) === fBaseline(1, 2), 'Same value');

assert(ScopedFunction('__scope__', 'return __scope__', {})(10) === 10, '"__scope__" param');
assert(ScopedFunction('return __scope__', { __scope__: 10 })() === 10, '"__scope__" expansion');

assert.deepStrictEqual(ScopedFunction('x, y', 'return [x, y]', {})(1, 2), [1, 2], 'squashed comma arguments');

assert.throws(() => ScopedFunction('return 0'), 'missing scope argument');
// empty body, etc as per spec https://www.ecma-international.org/ecma-262/6.0/#sec-createdynamicfunction
assert(ScopedFunction({})() == null, 'scope only => empty body');

assert(new ScopedFunction('return 0', {}), 'can be invoked as a constructor');

assert.throws(() => ScopedFunction('{{', {}), 'Function throw on body propagates');
assert.throws(() => ScopedFunction('-x', 'return 0', {}), 'Function throw on arguments propagates');

// precedence
global.x = 100;
assert(ScopedFunction('return x', {})() === 100, 'Global scope is accessible');
assert(ScopedFunction('return x', { x: 50 })() === 50, 'Scope shadows global');
assert(ScopedFunction('x', 'return x', { x: 50 })(10) === 10, 'Parameter shadows scope');
assert(ScopedFunction('x', 'return x', {})(10) === 10, 'Parameter shadows global');
global.x = void 0;

const s = { x: 10 };
const retainer = ScopedFunction('return x', s);
s.x = 1000;
assert(retainer() === 10, 'scope is cloned');

const hub = { name: 10 };
const sync = ScopedFunction('return hub.name', { hub });
hub.name = 20;
assert(sync() === 20, 'scope items are shared by reference');

assert(ScopedFunction('{x}', 'return x', {})({ x: 10 }) === 10, 'Destructuring');
assert(ScopedFunction('x = 10', 'return x', {})() === 10, 'Default');
assert(ScopedFunction('x = 10', 'return x', {})(20) === 20, 'Default is overridable');
assert.deepStrictEqual(ScopedFunction('...x', 'return x', {})(1,2), [1,2], 'Rest');

const o = { x: 10 };
assert(ScopedFunction('return this', {}).bind(o)() === o, 'can be bound');
assert(ScopedFunction('return this', {}).call(o) === o, 'can be called in context');
assert(ScopedFunction('return this', {}).apply(o) === o, 'can be applied to context');

assert(ScopedFunction('x', 'return x', {}).call(null, 10) === 10, 'can be applied to arguments');
assert(ScopedFunction('x', 'return x', {}).apply(null, [10]) === 10, 'can be applied to arguments');

assert.throws(() => ScopedFunction(`'use strict'; gb = 10`, {})(), 'respects strict mode');
assert(ScopedFunction(`ga = 10`, {})() == null && ga === 10, 'non-strict mode by default');
assert.throws(() => ScopedFunction('x', `'use strict'; gc = 10`, { x: 100 })(), 'still respects strict mode with arg expansion');

assert.deepStrictEqual(ScopedFunction('return arguments.length', {})(), 0, 'no extra stuff in "arguments"');
assert(ScopedFunction('return eval("123")', {})() === 123, 'can use "eval"');

assert(ScopedFunction('', {}).name === Function().name, 'name is set to "anonymous"');

// EITHER restriction: one arg per formal param OR parse argument string with escapes
//   proposal: drop interfce compatibility
console.log('Unit tests OK');


console.log('Benchmarks:', N_TRIAL, 'iterations');

console.time('scoped');
for (var i = 0; i < N_TRIAL; i++) f(1, 2);
console.timeEnd('scoped');

console.time('baseline');
for (var i = 0; i < N_TRIAL; i++) fBaseline(1, 2);
console.timeEnd('baseline');

const fancyArgs = ScopedFunction('{x = 0}', '...y', 'return sin(x) + cos(y[0])', { sin: Math.sin, cos: Math.cos });
function fancyArgsBaseline ({x = 0}, ...y) { return Math.sin(x) + Math.cos(y[0]); }

console.time('scoped-fancy-args');
for (var i = 0; i < N_TRIAL; i++) fancyArgs({}, 2);
console.timeEnd('scoped-fancy-args');

console.time('baseline-fancy-args');
for (var i = 0; i < N_TRIAL; i++) fancyArgsBaseline(1, 2);
console.timeEnd('baseline-fancy-args');


const userSolution = `
function ageMode(data) {
  return _.maxBy(
    _.values(_.groupBy(data, 'age')),
    v => v.length
  )[0].age;
}
`;
const _ = require('lodash');
const userFn = ScopedFunction(`return ${userSolution}`, { _ });
const isValid = userFn([{ age: 10 }, { age: 20 }, { age: 10 }]) === 10
