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
        'chain method ok': function(err, value) {
            assert.equal(value, 4, "values does not match");
        }
    },
    'chain a sync transformation': {
        topic: function() {
            var that = this;

            function asyncOne() {
                var deferred = new Deferred();
                process.nextTick(function() {
                    deferred.resolve(2);
                });
                return deferred.promise();
            }

            function trasformation(value) {
                return 2 * value;
            }

            asyncOne().transform(trasformation)
                      .then(function(value) {
                        that.callback(null, value);
                      });
        },
        'transform method ok': function(err, value) {
            assert.equal( 4, value, 'values does not match');
        }
    },
    'when promise rejected error callback called': {
        topic: function() {
            var that = this;

            function asyncOne() {
                var deferred = new Deferred();
                process.nextTick(function() {
                    deferred.reject(new Error('a sample error'));
                });
                return deferred.promise();
            }

            asyncOne().then(function(value) {
                throw new Error('this callback should not be invoked');
            },
            function(err) {
                that.callback(null, err);
            });
        },
        'then method error': function(err, value) {
            assert.instanceOf(value, Error, "the value should be error");
        }
    }
}).run();