const assert = require('assert');
const ScopedFunction = require('./index');


const N_TRIAL = 100000000;
const fBaseline = function (x, y) { return Math.sin(x) + Math.cos(y); };
const f = ScopedFunction('x', 'y', 'return sin(x) + cos(y)', { sin: Math.sin, cos: Math.cos });


console.log('Unit tests...');
assert(f(1, 2) === fBaseline(1, 2), 'Same value');
// name conflicts
// fancy item nesting
// missing scope argument
// constructor error
// scope / arguments precednce
console.log('Unit tests OK');

console.log('Benchmarks:', N_TRIAL, 'iterations');

console.time('scoped');
for (var i = 0; i < N_TRIAL; i++) f(1, 2);
console.timeEnd('scoped');

console.time('baseline');
for (var i = 0; i < N_TRIAL; i++) fBaseline(1, 2);
console.timeEnd('baseline');
