# ScopedFunction = new Function + scope

`ScopedFunction` allows you to inject scope object into `Function` constructor.
The properties of the scope object can be accesed in the function body as if they
were closure variables: `ScopedFunction('return s;', { s: 'hello' }) -> 'hello'`.

Build paper-thin DSLs over JavaScript syntax — allow your users to write math functions
in standard syntax, `exp(10 * cos(x))`, without prepending the nasty `Math`
builtin, or pass libraries to in-browser JS playgrounds.

There's no runtime performance penalty for functions compiled using `ScopedFunction`.
This library is a great foundation for safer and faster `eval` or `with`, the
infamous optimization busters. The library is tiny: 38 SLOC, or just 500 bytes
when minified.

## Usage

```js
// Use whichever you like
const ScopedFunction = require('ScopedFunction');
import ScopedFunction from 'scoped-function';
// You can also drop lib/scoped-function into your HTML if you feel like it

// Build your smallest DSL ever:
const trig = ScopedFunction('x', 'return sin(pi * x) + cos(pi * x)', {
  sin: Math.sin,
  cos: Math.cos,
  pi: Math.PI
});
const v = trig(1); // = -1

// Add slight rewriting:
const compileMath = e => ScopedFunction('x', `return ${e}`, Math);
compileMath('atan(exp(x) - 1)')(0); // = 0

// Inject libraries into user code
// Say you're building a JS course with live problems:
const userSolution = `
function ageMode(data) {
  if (_.isEmpty(data)) return undefined;
  return _.maxBy(
    _.values(_.groupBy(data, 'age')),
    v => v.length
  )[0].age;
}
`;
const _ = require('lodash');
const userFn = ScopedFunction(`return ${userSolution}`, { _ });
const isValid = userFn([{ age: 10 }, { age: 20 }, { age: 10 }]) === 10;

// You can also use ScopedFunction as a constructor:
const f = new ScopedFunction('x', 'return _.min(x)', { _ });
```

## Standards Compliance and Usage Notes

`ScopedFunction` shallow-clones the scope object — you can't add, remove, or change
the variables afterwards. However, the objects (as in `{ hub: {} }`) are shared
by reference. Use this to communicate between the functions, or opt out with
a `_.cloneDeep(...)`.

The functions produced mimic the ones that come from `Function(...)`:

 - respond to `typeof` / `instanceof`
 - have proper `call` / `bind` / `apply`
 - accessing `arguments` still works
 - name is set to `anonymous` as per the spec.

If you find a deviation, drop an issue.

Both `Function` and `ScopedFunction` accept non-simple ES6 formal
parameters: `...rest`, `{ destructuring }`, and `default = true`. Use these in
the browser, but remember that your code is compiled as-is, not transpiled,
and would break in browsers with poor ES6 support, like Safari.

Also note that this library does not give you a secure sanbox for untrusted code
— use https://github.com/patriksimek/vm2 for that.

## Installation
```sh
$ npm i --save scoped-function
$ yarn add scoped-function
```

Made by [Vladimir Klepov](https://github.com/thoughtspile).
