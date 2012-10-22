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

  'drain': function(done) {
    var fns = {
      a: function(state, callback) { state.a = 23; setTimeout(callback); },
      b: function(state, callback) { state.b = state.a + 19; callback(); }
    };

    var work = {
      a: [],
      b: ['a']
    };

    drain(fns, work)(function(state) {
      assert.equals(state, {a: 23, b: 42});
      done();
    });
  }
});

function drain(fns, work) {
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
