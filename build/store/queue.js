"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Queue = function () {
  function Queue() {
    _classCallCheck(this, Queue);

    this.container = {};
  }

  _createClass(Queue, [{
    key: "has",
    value: function has(str) {
      // To check if property is in the queue
      if (!(typeof str === "undefined" ? "undefined" : _typeof(str)) == "string") throw new Error("argument to `remove` method on Queue must be string");
      return this.container.hasOwnProperty(str);
    }
  }, {
    key: "clear",
    value: function clear() {
      // Clears queue
      this.container = {};
    }
  }, {
    key: "remove",
    value: function remove(str) {
      // Removes property from queue
      if (!(typeof str === "undefined" ? "undefined" : _typeof(str)) == "string") throw new Error("argument to `remove` method on Queue must be string");
      delete this.container[str];
    }
  }, {
    key: "add",
    value: function add(str) {
      // Adds property to queue
      if (!(typeof str === "undefined" ? "undefined" : _typeof(str)) == "string") throw new Error("argument to `add` method on Queue must be string");
      this.container[str] = true;
    }
  }, {
    key: "isPopulated",
    get: function get() {
      /*
       To check if queue is not empty. 
       Not neccessary to loop through entire object
       (Object.keys) to do this
      */
      var populated = false;
      for (var prop in this.container) {
        populated = true;
        break;
      }
      return populated;
    }
  }]);

  return Queue;
}();

exports.default = Queue;