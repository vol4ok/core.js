/*!
 * Copyright (c) 2010 Kris Zyp
 * Copyright (c) 2012 Aliaksandr Zhuhrou <zhygrr@gmail.com>
 * Some ideas taken from dart implementation of futures
 */

(function($) {
  
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

  Promise.prototype = {
    
    /**
     * @return a value for a resolved promise. Throws exception if a given promise
     * was either rejected or not resolved yet
     */
    value: function(){
      if (!this._isComplete) {
        throw new Error("Promise is not resolved yet!");
      }
      if (!this._error !== null) {
        throw this._error;
      }

      return this._value;
    },

    /**
     * @return exception if a given promise was rejected.
     */
    error: function() {
      if (!this._isComplete) {
        throw new Error("Promise is not resolved yet!");
      }
      return this._error;
    },

    /** @return either given promise was resolved or rejected */
    isComplete: function() {
      return this._isComplete;
    },

    /** @return true if the promise was resolved. */
    hasValue: function() {
      return this._isComplete && this._error === null;
    },

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
    then: function(resolvedCallback, errorCallback){
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
    },

    /**
     * @param completeCallback invokes a given callback when promise is complete
     */
    onComplete: function(completeCallback) {
      if (this._isComplete) {
        try {
          completeCallback(this);
        } catch(e) {}
      } else {
        this._completionListeners.push(completeCallback);
      }
    },

    /**
     * Allows chain multiple async method that being based on promise api.
     * @param transformation async function that allows chain multiple promises
     */
    chain: function(transformation) {
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
    },

    /**
     * Applies a sync transformation for a given future
     * @param transformation a sync transformation
     */
    transform: function(transformation) {
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
    },

    /// Private prototype members

    /** Internal function that invoked either on resolving or rejecting of a given promise */
    _complete: function() {
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
    },

    /**
     * Internal method used by Deferred for resolving a given promise
     * @param value
     * @private
     */
    _resolve: function(value) {
      if (this._isComplete) {
        throw new Error("This promise is already fulfilled");
      }
      this._value = value;
      this._complete();
    },

    /**
     * Internal method used by Deferred for rejecting a given promise
     * @param error
     * @private
     */
    _reject: function(error) {
      if (!error) {
        throw new Error("error argument should be provided");
      }
      if (this._isComplete) {
        throw new Error("This promise is already fulfilled");
      }

      this._error = error;
      this._complete();
    }
  };


  /** An utility that could create promises */
  function Deferred(){
    this._promise = new Promise();
  }
  
  Deferred.prototype = {
    
    /** @return a given promise */
    promise: function() {
      return this._promise;
    },

    /** calling resolve will resolve the promise */
    resolve: function(value){
      this._promise._resolve(value);
    },

    /** calling error will indicate that the promise failed */
    reject: function(error){
      this._promise._reject(error);
    }
    
  };
  
  // A deferred provides an API for creating and resolving a promise.
  $.Deferred = Deferred;
  
})(Core);