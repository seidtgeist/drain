# drain

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

## Or like this?

~~~ js
var tree = {
  a: function(callback) {
    callback(23);
  },

  b: ['a', function(aResult, callback) {
    callback(aResult + 19);
  }]
};

drain(tree)(function(result) {
  console.log(result);
  // 42
}
~~~

- Because if anyone wanted a shared `state` var it could
  also be accomplished via `var state` in a parent scope
