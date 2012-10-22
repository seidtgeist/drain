'use strict';

var _ = require('lodash');
var buster = require('buster');

buster.testCase('ox', {
  'findReady': function() {
    var work = {
      a: [],
      b: ['a'],
      c: ['a', 'b'],
      d: ['a', 'b', 'c']
    };

    assert.equals(findReady(work), ['a']);
  },

  'removeCompleted': function() {
    var work = {
      a: [],
      b: ['a'],
      c: ['a', 'b'],
      d: ['a', 'b', 'c']
    };

    assert.equals(removeCompleted('a', work), {
      b: [],
      c: ['b'],
      d: ['b', 'c']
    });
  },

  'ohMyDsl': function() {
    var input = {
      a: function() {},
      b: ['a', function() {}]
    };

    assert.equals(ohMyDsl(input), {
      fns: {
        a: input.a,
        b: input.b[1]
      },
      work: {
        a: [],
        b: ['a']
      }
    });
  },

  'drain': function(done) {
    var WAT = {
      a: function(state, callback) {
        state.a = 23;
        callback();
      },

      b: ['a', function(state, callback) {
        state.b = state.a + 19;
        callback();
      }]
    };

    drain(WAT)(function(state) {
      assert.equals(state, {a: 23, b: 42});
      done();
    });
  }
});

function ohMyDsl(nice) {
  return _.reduce(nice, function(proper, value, name) {
    var fn, deps;

    if (_.isFunction(value)) {
      fn = value;
      deps = [];
    } else {
      fn = value[value.length - 1];
      deps = value.slice(0, value.length - 1);
    }

    proper.fns[name] = fn;
    proper.work[name] = deps;

    return proper;
  }, {fns: {}, work: {}});
}

function drain(args) {
  var derp = ohMyDsl(args);
  var fns = derp.fns;
  var work = derp.work;
  
  var state = {};

  return function checkWork(callback) {
    if (_.isEmpty(work))
      return callback(state);

    var next = findReady(work);

    _.forEach(next, function(name) {
      var fn = fns[name];
      fn(state, function() {
        work = removeCompleted(name, work);
        checkWork(callback);
      });
    });
  };
}

function findReady(work) {
  return _.reduce(work, function(ready, dependencies, name) {
    if (_.isEmpty(dependencies))
      ready.push(name);
    return ready;
  }, []);
}

function removeCompleted(completedName, work) {
  return _.reduce(work, function(newWork, dependencies, name) {
    if (name !== completedName)
      newWork[name] = _.without(dependencies, completedName);
    return newWork;
  }, {});
}
