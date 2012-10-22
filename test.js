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
  }
});

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
