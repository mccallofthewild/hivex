'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _helpers = require('./helpers');

var _helpers2 = _interopRequireDefault(_helpers);

var _exceptions = require('./exceptions');

var _exceptions2 = _interopRequireDefault(_exceptions);

var _proxy = require('../observe/proxy');

var _proxy2 = _interopRequireDefault(_proxy);

var _queue = require('./queue');

var _queue2 = _interopRequireDefault(_queue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Store = function () {
  function Store(_ref) {
    var _this = this;

    var _ref$state = _ref.state,
        state = _ref$state === undefined ? {} : _ref$state,
        _ref$getters = _ref.getters,
        getters = _ref$getters === undefined ? {} : _ref$getters,
        _ref$setters = _ref.setters,
        setters = _ref$setters === undefined ? {} : _ref$setters,
        _ref$actions = _ref.actions,
        actions = _ref$actions === undefined ? {} : _ref$actions,
        _ref$modules = _ref.modules,
        modules = _ref$modules === undefined ? {} : _ref$modules;

    _classCallCheck(this, Store);

    this.listeners = {};
    this.queue = new _queue2.default();

    var add = function add(prop) {
      return _this.queue.add(prop);
    };

    this._state = new _proxy2.default(state, null, add);
    this._getters = getters;
    this._setters = setters;
    this._actions = actions;

    function createModuleStores(modules) {
      for (var prop in modules) {
        modules[prop] = new Store(modules[prop]);
      }
      return modules;
    }
    this._modules = createModuleStores(modules);
  }

  _createClass(Store, [{
    key: 'change',
    value: function change(setter, payload) {
      var func = this._setters[setter];
      if (!func) {
        throw new Error('Setter with name "' + setter + '" does not exist.');
      }
      var res = func(this._state, payload, this.methodArgs);
      this.updateListeners();
      return res;
    }
  }, {
    key: 'access',
    value: function access(getter) {
      var func = this._getters[getter];
      if (!func) {
        throw new Error('Getter with name "' + getter + '" does not exist.');
      }
      var res = func(this._state);
      return res;
    }
  }, {
    key: 'send',
    value: function send(action, payload) {
      var myHivex = this;
      var arg = _extends({}, this.methodArgs, {
        state: this._state,
        done: function done() {
          myHivex.updateListeners();
        }
      });
      var func = this._actions[action];
      if (!func) {
        throw new Error('Action with name "' + action + '" does not exist.');
      }
      var res = func(arg, payload);
      return res;
    }
  }, {
    key: 'module',
    value: function module(moduleQuery) {
      /*
        to give users access to a module,
        good for when someone chooses to 
        have modules, but not use openers
      */
      return _helpers2.default.moduleFromQuery(moduleQuery, this);
    }
  }, {
    key: 'listen',
    value: function listen(component) {

      var myHivex = this;

      var mountFunc = component.componentDidMount,
          unmountFunc = component.componentWillUnmount;


      var idKey = "_hivex_id";

      component.componentDidMount = function () {
        try {
          if (mountFunc) mountFunc.bind(component).apply(undefined, arguments);
        } catch (error) {
          Hivex.error(error);
        }
        component[idKey] = component.constructor.name + '/timestamp/' + Date.now() + '/id/' + Math.round(Math.random() * 10000000);
        component._hivex_mounted = true;
        component._hivex_mounted_at = new Date();
        myHivex.listeners[component[idKey]] = component;
        myHivex.updateListeners();
      };

      component.componentWillUnmount = function () {

        try {
          if (unmountFunc) unmountFunc.bind(component).apply(undefined, arguments);
          myHivex.listeners[component[idKey]]._hivex_mounted = false;
          component._hivex_mounted = false;
        } catch (error) {
          Hivex.error(error);
        }
        delete myHivex.listeners[component[idKey]];
      };
    }
  }, {
    key: 'updateListeners',
    value: function updateListeners() {

      // if queue is empty, return.
      if (!this.queue.isPopulated) return;

      for (var listenerKey in this.listeners) {

        var listener = this.listeners[listenerKey];

        if (listener._hivex_mounted && listener.state) {

          var futureState = _helpers2.default.getStateUpdatesFromQuery(listener, this._state, this.queue);

          /* 
            If futureState is not empty, run setState (react method) on component
            (update listener)
          */

          if (!!Object.keys(futureState).length) {
            listener.setState(futureState);
          }
        }
      }

      this.queue.clear();
    }
  }, {
    key: 'openSetters',
    value: function openSetters() {
      var myHivex = this;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var _helpers$parseOpenArg = _helpers2.default.parseOpenArgs(args),
          _helpers$parseOpenArg2 = _slicedToArray(_helpers$parseOpenArg, 3),
          moduleQuery = _helpers$parseOpenArg2[0],
          query = _helpers$parseOpenArg2[1],
          component = _helpers$parseOpenArg2[2];

      var module = _helpers2.default.moduleFromQuery(moduleQuery, this);

      /*
        If `module` is not the module we are currently in,
        open its setters instead.
      */

      if (module !== this) return module.openSetters(query, component);

      // `formattedKeys` are the user-defined keys which alias properties on a hivex object 
      var formattedKeys = _helpers2.default.formatObjectQuery(query);

      var setters = {};

      var _loop = function _loop(alias) {
        var name = formattedKeys[alias];
        setters[alias] = function (payload) {
          myHivex.change(name, payload);
        };
      };

      for (var alias in formattedKeys) {
        _loop(alias);
      }

      Object.assign(component, setters);
    }
  }, {
    key: 'openActions',
    value: function openActions() {
      var myHivex = this;

      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      var _helpers$parseOpenArg3 = _helpers2.default.parseOpenArgs(args),
          _helpers$parseOpenArg4 = _slicedToArray(_helpers$parseOpenArg3, 3),
          moduleQuery = _helpers$parseOpenArg4[0],
          query = _helpers$parseOpenArg4[1],
          component = _helpers$parseOpenArg4[2];

      var module = _helpers2.default.moduleFromQuery(moduleQuery, this);

      /*
        If `module` is not the module we are currently in,
        open its actions instead.
      */
      if (module !== this) return module.openActions(query, component);

      // `formattedKeys` are the user-defined keys which alias properties on a hivex object 
      var formattedKeys = _helpers2.default.formatObjectQuery(query);

      var actions = {};

      var _loop2 = function _loop2(alias) {
        var name = formattedKeys[alias];
        actions[alias] = function (payload) {
          module.send(name, payload);
        };
      };

      for (var alias in formattedKeys) {
        _loop2(alias);
      }

      Object.assign(component, actions);
    }
  }, {
    key: 'openState',
    value: function openState() {
      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      var _helpers$parseOpenArg5 = _helpers2.default.parseOpenArgs(args),
          _helpers$parseOpenArg6 = _slicedToArray(_helpers$parseOpenArg5, 3),
          moduleQuery = _helpers$parseOpenArg6[0],
          query = _helpers$parseOpenArg6[1],
          component = _helpers$parseOpenArg6[2];

      var module = _helpers2.default.moduleFromQuery(moduleQuery, this);

      /*
        If `module` is not the module we are currently in,
        open its state instead. The module's state will not
        be reactive otherwise.
      */
      if (module !== this) return module.openState(query, component);

      // `formattedKeys` are the user-defined keys which alias properties on a hivex object 
      var formattedKeys = _helpers2.default.formatObjectQuery(query);

      component.hivexStateKeys = formattedKeys;

      this.listen(component);

      return _helpers2.default.formatObjectPieceForComponent(module._state, formattedKeys);
    }
  }, {
    key: 'methodArgs',
    get: function get() {
      /*
        Allows you to use object destructuring on methods
        without losing scope of `this`
      */
      return {
        access: this.access.bind(this),
        change: this.change.bind(this),
        send: this.send.bind(this)
      };
    }
  }]);

  return Store;
}();

exports.default = Store;