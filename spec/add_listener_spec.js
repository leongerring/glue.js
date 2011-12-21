var vows   = require('vows')
,   assert = require('assert')
,   Glue   = require(__dirname + "/../lib/glue");

var suite  = vows.describe('addListener');

suite.addBatch({
  "any key": {
    topic: new Glue({}),

    "can be an anonymous function": function(topic) {
      topic.target = {v1: 0, v2: 0};
      topic.resetListeners();

      var invoked = 0;

      topic.addListener(function() {
        invoked++;
      });

      topic.set('v1', 1);
      assert.equal(invoked, 1);

      topic.set('v2', 1);
      assert.equal(invoked, 2);
    },

    "can be explicitly specified": function(topic) {
      topic.target = {v1: 0, v2: 0};
      topic.resetListeners();

      var invoked = 0;

      topic.addListener("*", function() {
        invoked++;
      });

      topic.set('v1', 1);
      assert.equal(invoked, 1);

      topic.set('v2', 1);
      assert.equal(invoked, 2);
    },

    "invokes callback in the scope of the target object": function(topic) {
      var value;

      topic.target = {v1: ''};
      topic.resetListeners();

      topic.addListener(function() {
        value = this.v1;
      });

      topic.set('v1', 'value');

      assert.equal(value, 'value');
    }
  },

  "assigned keys": {
    topic: new Glue({}),

    "can be assigned to a key": function(topic) {
      var invoked = false;

      topic.target = {};
      topic.resetListeners();

      topic.addListener("v1", function() {
        invoked = true;
      });

      topic.set('v2', 'bar');
      assert.equal(invoked, false);

      topic.set('v1', 'baz');
      assert.equal(invoked, true);
    },

    "can be assigned do an object without a key": function(topic) {
      var invoked = false
        , obj     = { value: '' };

      topic.target = {};

      topic.addListener(obj, function(mgs) {
        obj.value = mgs.newValue;
      });

      topic.set('v1', 'baz');
      assert.equal(obj.value, 'baz');

      topic.set('v2', 'bar');
      assert.equal(obj.value, 'bar');
    },

    "can be assigned to an object with a key": function(topic) {
      var invoked = false
        , obj     = { value: '' };

      topic.target = {};
      topic.resetListeners();

      topic.addListener('v1', obj, function(msg) {
        this.value = msg.newValue;
      });

      topic.set('v1', 'baz');
      assert.equal(obj.value, 'baz');

      topic.set('v2', 'bar');
      assert.equal(obj.value, 'baz');
    },

    "can be nested": function(topic) {
      var invoked = false;

      topic.target = { v1: {n1: 'foo'}};
      topic.resetListeners();

      topic.addListener('v1.n1', function(msg) {
        invoked = true;
      });

      topic.set("v1.n1", "bar");
      assert.equal(invoked, true);
    },

    "invokes callback in the scope of target when not specified": function(topic) {
      var value;

      topic.target = {v1: ''};
      topic.resetListeners();

      topic.addListener('v1', function() {
        value = this.v1;
      });

      topic.set('v1', 'value');

      assert.equal(value, 'value');
    }
  },

  "for computed keys": {
    topic: new Glue({}),

    "can be assigned to an anonymous function": function(topic) {
      var invoked = false;

      topic.target = {arr: [2]};
      topic.resetListeners();

      topic.addListener('arr#length', function() {
        invoked = true;
      });

      topic.set('arr', [2]);
      assert.equal(invoked, false);

      topic.push('arr', 2);
      assert.equal(invoked, true);
    },

    "can be assigned with a target object": function(topic) {
      var anObject = { value: 0 };

      topic.target = { arr: [] };
      topic.resetListeners();

      topic.addListener('arr#length', anObject, function(msg) {
        this.value = msg.newValue;
      });

      topic.set('arr', [1]);
      assert.deepEqual(anObject, {value: 1});
    },

    "can be assigned multiple target objects": function(topic) {
      var obj1 = { len: 0 }
        , obj2 = { len: 0 };

      topic.target = { arr: [] };
      topic.resetListeners();

      topic.addListener('arr#length', obj1, function(msg) {
        this.len = msg.newValue;
      });

      topic.addListener('arr#length', obj2, function(msg) {
        this.len = msg.newValue;
      });

      topic.set('arr', [1]);

      assert.deepEqual(obj1, {len: 1});
      assert.deepEqual(obj2, {len: 1});
    }
  },

  "elements of collections": {
    topic: new Glue([]),

    "can listen to individual elements within an array": function(topic) {
      var message;

      topic.target = [1, 2, 3, 4, 5];

      topic.addListener('[]', function(msg) {
        message = msg;
      });

      topic.set('[2]', 9);

      assert.deepEqual(message, {
          operation: 'set'
        , oldValue: 3
        , newValue: 9
        , index: 2
      });
    },

    "notifies per element modified": function(topic) {
      var removed = [];

      topic.target = [1, 2, 3, 4, 5];

      topic.addListener('[]', function(msg) {
        removed.push(msg.oldValue);
      });

      topic.filter(function(num) {
        return num % 2 === 0;
      });

      assert.deepEqual(removed, [1, 3, 5]);
    },

    "can be within an obj": function(topic) {
      var index;

      topic.target = { v1: [1, 2, 3, 4, 5]};

      topic.addListener('v1[]', function(msg) {
        index = msg.index;
      });

      topic.set('v1[2]', 9);

      assert.deepEqual(index, 2);
    },

    "notifies array itself of the change": function(topic) {
      var index;

      topic.target = { arr: [1, 2, 3, 4, 5]};

      topic.addListener('arr', function(msg) {
        index = msg.index;
      });

      topic.set('arr[2]', [1,2,3]);

      assert.deepEqual(index, 2);
    }
  },

  "caching calculated values": {
    topic: new Glue({}),

    "stores computed value into 'topic.listeners.oldValues' hash ": function(topic) {
      topic.target = {arr: [2]};

      topic.addListener('arr#length', function() {});
      topic.push('arr', 2);

      assert.equal(topic.listeners.oldValues['arr.length'], 2);
    },

    "updates value as the calculated value changes": function(topic) {
      topic.target = {arr: [2]};

      topic.addListener('arr#length', function() {});

      topic.push('arr', 2);
      assert.equal(topic.listeners.oldValues['arr.length'], 2);

      topic.push('arr', 2);
      assert.equal(topic.listeners.oldValues['arr.length'], 3);
    },
  },


  "multiple": {
    topic: new Glue({}),

    "stores computed value into 'topic.listeners.oldValues' hash ": function(topic) {
      var invoked = [];
      topic.target = {v1: '', v2: ''};

      topic.addListener('v1, v2', function() {
        invoked.push(1);
      });

      topic.set('v1, v2', 2);
      assert.equal(invoked.length, 2);
    },

    "can set target obj and handler": function(topic) {
      var obj = {v1: ''};
      topic.target = {v1: '', v2: ''};

      topic.addListener('v1, v2', obj, function() {
        obj.v1 = 'set';
      });
      topic.set('v1, v2', 2);

      assert.equal(obj.v1, 'set');
    },
  },

  "chainability": {
    topic: new Glue({}),

    "returns itself for chainability": function(topic) {
      var returnedValue = topic.addListener(function() {});
      assert.equal(topic, returnedValue);
    }
  }
});

suite.export(module);
