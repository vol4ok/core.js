// A basic implementation of js promises
// Kris Zyp
// Updates/added features by ...Max... (Max Motovilov)
// this is based on the CommonJS spec for promises:
// http://wiki.commonjs.org/wiki/Promises
// Includes convenience functions for promises, much of this is taken from Tyler Close's ref_send
// and Kris Kowal's work on promises.
// MIT License
// Some ideas taken from dart implementation of futures
// Copyright (c) 2012 Aliaksandr Zhuhrou <zhygrr@gmail.com>

// commented out due to: http://code.google.com/p/v8/issues/detail?id=851
// todo zhuhrou a - try to use this function. Need investigate its effects
var freeze = Object.freeze || function(){};

/**
 * Default constructor that creates a self-resolving Promise. Not all promise implementations
 * need to use this constructor.
 */
var Promise = function(){
    this._isComplete = false;
    this._value = null;
    this._error = null;
    this._errorHandled = false;
    this._successListeners = [];
    this._errorHandlers = [];
    this._completionListeners = [];
};

/**
 * @return a value for a resolved promise. Throws exception if a given promise
 * was either rejected or not resolved yet
 */
Promise.prototype.value = function(){
    if (!this._isComplete) {
        throw new Error("Promise is not resolved yet!");
    }
    if (!this._error !== null) {
        throw this._error;
    }

    return this._value;
};

/**
 * @return exception if a given promise was rejected.
 */
Promise.prototype.error = function() {
    if (!this._isComplete) {
        throw new Error("Promise is not resolved yet!");
    }
    return this._error;
};

/** @return either given promise was resolved or rejected */
Promise.prototype.isComplete = function() {
    return this._isComplete;
};

/** @return true if the promise was resolved. */
Promise.prototype.hasValue = function() {
    return this._isComplete && this._error === null;
};

/**
 * If this promise is resolved and has a value, the resolvedCallback is called
 * with the value. If this promise is rejected then errorCallback is called.
 * throws an exception if errorCallback is not provided.
 *
 * If errorCallback returns true the error is considered handled
 * In other case the error will be throws when the promise is rejected.
 *
 * @param resolvedCallback callback invoked on resolution
 * @param errorCallback callback invoked on error handling (Optional)
 */
Promise.prototype.then = function(resolvedCallback, errorCallback){
    if (this.hasValue()) {
        resolvedCallback(this._value);
    } else if (!this.isComplete()) {
        this._successListeners.push(resolvedCallback);
        if (errorCallback) {
            this._errorHandlers.push(errorCallback);
        }
    } else if (!this._errorHandled) {
        if (errorCallback) {
            errorCallback(this._error);
        } else {
            throw this._error;
        }
    }
};

/**
 * @param completeCallback invokes a given callback when promise is complete
 */
Promise.prototype.onComplete = function(completeCallback) {
    if (this._isComplete) {
        try {
            completeCallback(this);
        } catch(e) {}
    } else {
        this._completionListeners.push(completeCallback);
    }
};

/**
 * Allows chain multiple async method that being based on promise api.
 * @param transformation async function that allows chain multiple promises
 */
Promise.prototype.chain = function(transformation) {
    var deferred = new Deferred();
    this.onComplete(function( promise ) {
        if (!promise.hasValue()) {
            deferred.reject(promise.error());
            return;
        }

        try {
            var chainPromise = transformation(promise.value());
            chainPromise.then(function(value) { deferred.resolve(value); },
                              function(error) { deferred.reject(error); });
        } catch (e) {
            deferred.reject(e);
        }
    });
    return deferred.promise();
};

/**
 * Applies a sync transformation for a given future
 * @param transformation a sync transformation
 */
Promise.prototype.transform = function(transformation) {
    var deferred = new Deferred();
    this.onComplete(function(promise) {
        if (!this.hasValue()) {
            deferred.reject(promise.error());
        } else {
            try {
                var transformed = transformation(promise.value());
                deferred.resolve(transformed);
            } catch (e) {
                deferred.reject(e);
            }
        }
    });
    return deferred.promise();
};

/// Private prototype members

/** Internal function that invoked either on resolving or rejecting of a given promise */
Promise.prototype._complete = function() {
    this._isComplete = true;

    try {
        if (this._error !== null) {
            for (var i = 0; i < this._errorHandlers.length; i++) {
                var handler = this._errorHandlers[i];
                if (handler(this._error) === true) {
                    this._errorHandled = true;
                    break;
                }
            }
        }

        if (this.hasValue()) {
            for (var i = 0; i < this._successListeners.length; i++) {
                var listener = this._successListeners[i];
                listener(this.value());
            }
        } else {
            if (!this._errorHandled) {
                throw this._error;
            }
        }
    } finally {
        for (var i = 0; i < this._completionListeners.length; i++) {
            var listener = this._completionListeners[i];
            try {
                listener(this);
            }
            catch (e) {}
        }
    }
};

/**
 * Internal method used by Deferred for resolving a given promise
 * @param value
 * @private
 */
Promise.prototype._resolve = function(value) {
    if (this._isComplete) {
        throw new Error("This promise is already fulfilled");
    }
    this._value = value;
    this._complete();
};

/**
 * Internal method used by Deferred for rejecting a given promise
 * @param error
 * @private
 */
Promise.prototype._reject = function(error) {
    if (!error) {
        throw new Error("error argument should be provided");
    }
    if (this._isComplete) {
        throw new Error("This promise is already fulfilled");
    }

    this._error = error;
    this._complete();
};

// A deferred provides an API for creating and resolving a promise.
exports.Deferred = Deferred;

/** An utility that could create promises */
function Deferred(){
    this._promise = new Promise();
}

/** @return a given promise */
Deferred.prototype.promise = function() {
    return this._promise;
};

/** calling resolve will resolve the promise */
Deferred.prototype.resolve = function(value){
    this._promise._resolve(value);
};

/** calling error will indicate that the promise failed */
Deferred.prototype.reject = function(error){
    this._promise._reject(error);
};

