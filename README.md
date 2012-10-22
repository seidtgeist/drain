# drain

~~~ js
var dag = {
  a: function(state, callback) {
    state.a = 23;
    callback();
  },

  b: ['a', function(state, callback) {
    state.b = state.a + 19;
    callback();
  }]
};

drain(dag)(function(state) {
  console.log(state);
  // { a: 23, b: 42 }
}
~~~
