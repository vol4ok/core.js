var vows = require('vows');
var assert = require('assert');
var util = require('util');
var Deferred = require('../lib/index.js').Deferred;

vows.describe('Test Promise Methods').addBatch({
    'when promise resolved success callback called': {
        topic: function() {
            var that = this;
            var deferred = new Deferred();
            process.nextTick(function() {
                deferred.resolve(101);
            });
            var promise = deferred.promise();
            promise.then(function(value) {
                that.callback(null, value);
            },
            function(err) {
                console.log("throw an error?");
                throw err;
            });
        },
        'then method ok': function(err, value) {
            assert.equal(value, 101, "value returned by promise does not match");
        }
    },
    'when promise chained success callback called': {
        topic: function() {
            var that = this;

            function asyncOne() {
                var deferred = new Deferred();
                process.nextTick(function() {
                    deferred.resolve(2);
                });
                return deferred.promise();
            }

            function asyncTwo(value) {
                var deferred = new Deferred();
                process.nextTick(function() {
                    deferred.resolve(value * 2);
                });
                return deferred.promise();
            }

            asyncOne().chain(asyncTwo)
                      .then(function(value) {
                        that.callback(null, value);
                      });
        },
        'chain method ok': function(value) {
            assert.equal(value, 4, "values does not match");
        }
    }
}).run();