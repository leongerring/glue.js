var vows   = require('vows')
  , assert = require('assert')
  , Glue   = require(__dirname + "/../lib/glue")

var suite  = vows.describe('normalizing keys');

suite.addBatch({
  "normalizing key": {
    "removes computed key indicator": function() {
      assert.equal(Glue.normalizeKeys("fi.#fi.fum()"), "fi.fi.fum()");
    },

    "removes spaces": function() {
      assert.equal(Glue.normalizeKeys("fi.#fi.   fum()"), "fi.fi.fum()");
    },

    "splits keys by comma": function() {
      assert.deepEqual(Glue.normalizeKeys("fi.#fi, fum()"), ["fi.fi", "fum()"]);
    }
  }
});

suite.export(module);

