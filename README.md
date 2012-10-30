# drain

[![Build Status](https://secure.travis-ci.org/evilhackerdude/drain.png)](http://travis-ci.org/evilhackerdude/drain)

## Current API

~~~ js
var tree = {
  a: function(state, callback) {
    state.a = 23;
    callback();
  },

  b: ['a', function(state, callback) {
    state.b = state.a + 19;
    callback();
  }]
};

drain(tree)(function(state) {
  console.log(state);
  // { a: 23, b: 42 }
}
~~~

## Future API

~~~ js
var tree = {
  a: function(callback) {
    callback(23);
  },

  b: ['a', function(aResult, callback) {
    callback(aResult + 19);
  }],

  final: ['b', function(bResult) {
    console.log(result); // 42
  });
};

drain(tree)();
~~~

- Because if anyone wanted a shared `state` var it could
  also be accomplished via `var state` in a parent scope
- Also problem with the current API: Everything ends up in one big
  object unless state is managed very carefully & manually
  -> potential heap size problems. With individual results
  passed in and possibly fully consumed the risk is far lower.
- The "final" callback argument to drain doesn't make any sense if
  the explicit state var is removed. Must now be part of the tree.
- Does it make sense to parameterize drain other than just wrapping
  a work-tree in a function and using lex. scope? (could avoid GC issues?)
  With parameterization, who'd get parameters, what would be the entry point?
- Without parameterization, does it make sense to immediately execute on `drain(tree)`
  instead of returning a function for (possibly) later execution?