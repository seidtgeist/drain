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
  },

  'crazy drain': function(done) {
    this.timeout = 10000;

    function lwc(name, wait) {
      return function(state, callback) {
        console.log(name + ' called, waiting' + wait);
        state[name] = 'took ' + wait;
        setTimeout(callback, wait);
      };
    }

    var WAT = {
      a0: lwc('a0', 100),
      a1: lwc('a1', 200),
      a2: lwc('a2', 400),
      a3: lwc('a3', 800),

      b: ['a0', 'a1', lwc('b', 3000)],

      c: ['a2', 'a3', lwc('c', 2000)],

      d: ['b', 'c', lwc('d', 100)],

      e: ['a0', 'd', lwc('e', 100)]
    };

    drain(WAT)(function(state) {
      assert.equals(state, {
        a0: 'took 100',
        a1: 'took 200',
        a2: 'took 400',
        a3: 'took 800',
        b: 'took 3000',
        c: 'took 2000',
        d: 'took 100',
        e: 'took 100'
      });
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

  var pending = [];
  var state = {};

  return function checkWork(callback) {
    if (_.isEmpty(work) && _.isEmpty(pending))
      return callback(state);

    var next = findReady(work);

    _.forEach(next, function(name) {
      var fn = fns[name];
      work = removeCompleted(name, work);
      pending.push(name);
      fn(state, function() {
        pending = _.without(pending, name);
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
