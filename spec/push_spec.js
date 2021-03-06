var vows   = require('vows')
  , assert = require('assert')
  , Glue   = require(__dirname + "/../lib/glue")

var suite  = vows.describe('pushing to the target object');

suite.addBatch({
  "non nested": {
    "pushes an element into an array": function() {
      var topic = new Glue([]);

      topic.push(1);
      assert.deepEqual(topic.target, [1]);
    },

    "notifies listeners to target": function() {
      var topic = new Glue([]),
          message;

      topic.addObserver('[]', function(msg) {
        message = msg;
      });

      topic.push(2);

      assert.deepEqual(message, {
        operation: 'push',
        index: 0,
        value: 2
      });
    }
  },

  "nested arrays": {
    "can be push into with a key": function() {
      var topic = new Glue({ arr: [] });

      topic.push('arr', 1);
      assert.deepEqual(topic.target.arr, [1]);
    },

    "can be push into arrays nested under other keys": function() {
      var topic = new Glue({ v1: { arr: [] }});

      topic.push('v1.arr', 1);
      assert.deepEqual(topic.target.v1.arr, [1]);
    },

    "can be push into arrays nested under other keys": function() {
      var topic = new Glue({ arr1: [ {arr2: [] } ]});

      topic.push('arr1[0].arr2', 1);
      assert.deepEqual(topic.target, { arr1: [ {arr2: [1] }] });
    },

    "notifies listeners to target": function() {
      var message,
          topic = new Glue({ arr: [] });

      topic.addObserver('arr', function(msg) {
        message = msg;
      });

      topic.push('arr', 2);

      assert.deepEqual(message, {
        value: [ 2 ],
        operation: 'push'
      });
    }
  },

  chainability: {
    topic: new Glue([]),

    "returns itself for chainalibility": function(glue) {
      var returnedValue = glue.push(1);
      assert.deepEqual(glue, returnedValue)
    }
  }
});

suite.export(module);

