var vows   = require('vows')
  , assert = require('assert')
  , Glue   = require(__dirname + "/../lib/glue")

var suite  = vows.describe('removing from target obj');

suite.addBatch({
  "non collection": {
    "removes a key": function() {
      var topic = new Glue({v1: 'value'});
      topic.remove('v1');

      assert.equal(topic.target.v1, undefined);
    },

    "removes nested key": function() {
      var topic = new Glue({v1: {v2: 'value'}});
      topic.remove('v1.v2');

      assert.equal(topic.target.v1.v2, undefined);
    },

    "notifies listeners that the value has been removed": function() {
      var message,
          topic = new Glue({v1: 'value'});

      topic.addListener('v1', function(msg) {
        message = msg;
      });

      topic.remove('v1');

      assert.deepEqual(message, {
        value: undefined,
        operation: 'remove'
      });
    }
  },

  "collection": {
    "removes from index": function() {
      var topic = new Glue([1, 2, 3]);
      topic.remove('[1]');

      assert.deepEqual(topic.target, [1,3]);
    },

    "remove from an array in an object": function() {
      var topic = new Glue({arr: [1, 2, 3]});
      topic.remove('arr[1]');

      assert.deepEqual(topic.target.arr, [1,3]);
    },

    "remove from a multi-dimentional array": function() {
      var topic = new Glue({arr: [[1, 2, 3], [1, 2, 3]]});
      topic.remove('arr[0][1]');

      assert.deepEqual(topic.target.arr, [[1, 3], [1, 2, 3]]);
    },

    "notifies listeners of collection": function() {
      var message,
          topic = new Glue({arr: [1, 2, 3]});

      topic.resetListeners();

      topic.addListener("arr[0]", function(msg) {
        message = msg;
      });


      topic.remove('arr[0]');
      assert.deepEqual(message, {
        value: 2,
        operation: 'remove'
      });
    }
  },

  "hybrid": {
    topic: new Glue({arr: [{v1: 'value1', v4: 'value4'}, {v2: 'value2'} ]}),

    "can remove from keys that are inside an array": function(topic) {
      topic.remove('arr[0].v1');
      assert.deepEqual(topic.target, {arr: [{v4: 'value4'}, {v2: 'value2'} ]});
    }
  },

  "returns removed item": {
    topic: new Glue([1]),

    "returns itself for chainalibility": function(topic) {
      var returnedValue = topic.remove('[0]');
      assert.deepEqual(returnedValue, 1)
    }
  }
});

suite.export(module);
