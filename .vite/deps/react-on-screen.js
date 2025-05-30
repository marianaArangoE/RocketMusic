import {
  require_prop_types
} from "./chunk-L4UMR4YY.js";
import {
  require_react
} from "./chunk-TVFQMRVC.js";
import {
  __commonJS
} from "./chunk-G3PMV62Z.js";

// node_modules/lodash.throttle/index.js
var require_lodash = __commonJS({
  "node_modules/lodash.throttle/index.js"(exports, module) {
    var FUNC_ERROR_TEXT = "Expected a function";
    var NAN = 0 / 0;
    var symbolTag = "[object Symbol]";
    var reTrim = /^\s+|\s+$/g;
    var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
    var reIsBinary = /^0b[01]+$/i;
    var reIsOctal = /^0o[0-7]+$/i;
    var freeParseInt = parseInt;
    var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
    var freeSelf = typeof self == "object" && self && self.Object === Object && self;
    var root = freeGlobal || freeSelf || Function("return this")();
    var objectProto = Object.prototype;
    var objectToString = objectProto.toString;
    var nativeMax = Math.max;
    var nativeMin = Math.min;
    var now = function() {
      return root.Date.now();
    };
    function debounce(func, wait, options) {
      var lastArgs, lastThis, maxWait, result, timerId, lastCallTime, lastInvokeTime = 0, leading = false, maxing = false, trailing = true;
      if (typeof func != "function") {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      wait = toNumber(wait) || 0;
      if (isObject(options)) {
        leading = !!options.leading;
        maxing = "maxWait" in options;
        maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
        trailing = "trailing" in options ? !!options.trailing : trailing;
      }
      function invokeFunc(time) {
        var args = lastArgs, thisArg = lastThis;
        lastArgs = lastThis = void 0;
        lastInvokeTime = time;
        result = func.apply(thisArg, args);
        return result;
      }
      function leadingEdge(time) {
        lastInvokeTime = time;
        timerId = setTimeout(timerExpired, wait);
        return leading ? invokeFunc(time) : result;
      }
      function remainingWait(time) {
        var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime, result2 = wait - timeSinceLastCall;
        return maxing ? nativeMin(result2, maxWait - timeSinceLastInvoke) : result2;
      }
      function shouldInvoke(time) {
        var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime;
        return lastCallTime === void 0 || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
      }
      function timerExpired() {
        var time = now();
        if (shouldInvoke(time)) {
          return trailingEdge(time);
        }
        timerId = setTimeout(timerExpired, remainingWait(time));
      }
      function trailingEdge(time) {
        timerId = void 0;
        if (trailing && lastArgs) {
          return invokeFunc(time);
        }
        lastArgs = lastThis = void 0;
        return result;
      }
      function cancel() {
        if (timerId !== void 0) {
          clearTimeout(timerId);
        }
        lastInvokeTime = 0;
        lastArgs = lastCallTime = lastThis = timerId = void 0;
      }
      function flush() {
        return timerId === void 0 ? result : trailingEdge(now());
      }
      function debounced() {
        var time = now(), isInvoking = shouldInvoke(time);
        lastArgs = arguments;
        lastThis = this;
        lastCallTime = time;
        if (isInvoking) {
          if (timerId === void 0) {
            return leadingEdge(lastCallTime);
          }
          if (maxing) {
            timerId = setTimeout(timerExpired, wait);
            return invokeFunc(lastCallTime);
          }
        }
        if (timerId === void 0) {
          timerId = setTimeout(timerExpired, wait);
        }
        return result;
      }
      debounced.cancel = cancel;
      debounced.flush = flush;
      return debounced;
    }
    function throttle(func, wait, options) {
      var leading = true, trailing = true;
      if (typeof func != "function") {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      if (isObject(options)) {
        leading = "leading" in options ? !!options.leading : leading;
        trailing = "trailing" in options ? !!options.trailing : trailing;
      }
      return debounce(func, wait, {
        "leading": leading,
        "maxWait": wait,
        "trailing": trailing
      });
    }
    function isObject(value) {
      var type = typeof value;
      return !!value && (type == "object" || type == "function");
    }
    function isObjectLike(value) {
      return !!value && typeof value == "object";
    }
    function isSymbol(value) {
      return typeof value == "symbol" || isObjectLike(value) && objectToString.call(value) == symbolTag;
    }
    function toNumber(value) {
      if (typeof value == "number") {
        return value;
      }
      if (isSymbol(value)) {
        return NAN;
      }
      if (isObject(value)) {
        var other = typeof value.valueOf == "function" ? value.valueOf() : value;
        value = isObject(other) ? other + "" : other;
      }
      if (typeof value != "string") {
        return value === 0 ? value : +value;
      }
      value = value.replace(reTrim, "");
      var isBinary = reIsBinary.test(value);
      return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
    }
    module.exports = throttle;
  }
});

// node_modules/shallowequal/index.js
var require_shallowequal = __commonJS({
  "node_modules/shallowequal/index.js"(exports, module) {
    module.exports = function shallowEqual(objA, objB, compare, compareContext) {
      var ret = compare ? compare.call(compareContext, objA, objB) : void 0;
      if (ret !== void 0) {
        return !!ret;
      }
      if (objA === objB) {
        return true;
      }
      if (typeof objA !== "object" || !objA || typeof objB !== "object" || !objB) {
        return false;
      }
      var keysA = Object.keys(objA);
      var keysB = Object.keys(objB);
      if (keysA.length !== keysB.length) {
        return false;
      }
      var bHasOwnProperty = Object.prototype.hasOwnProperty.bind(objB);
      for (var idx = 0; idx < keysA.length; idx++) {
        var key = keysA[idx];
        if (!bHasOwnProperty(key)) {
          return false;
        }
        var valueA = objA[key];
        var valueB = objB[key];
        ret = compare ? compare.call(compareContext, valueA, valueB, key) : void 0;
        if (ret === false || ret === void 0 && valueA !== valueB) {
          return false;
        }
      }
      return true;
    };
  }
});

// node_modules/react-on-screen/lib/TrackVisibility.js
var require_TrackVisibility = __commonJS({
  "node_modules/react-on-screen/lib/TrackVisibility.js"(exports) {
    "use strict";
    exports.__esModule = true;
    exports.default = void 0;
    var _react = _interopRequireWildcard(require_react());
    var _propTypes = _interopRequireDefault(require_prop_types());
    var _lodash = _interopRequireDefault(require_lodash());
    var _shallowequal = _interopRequireDefault(require_shallowequal());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _interopRequireWildcard(obj) {
      if (obj && obj.__esModule) {
        return obj;
      } else {
        var newObj = {};
        if (obj != null) {
          for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
              var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {};
              if (desc.get || desc.set) {
                Object.defineProperty(newObj, key, desc);
              } else {
                newObj[key] = obj[key];
              }
            }
          }
        }
        newObj.default = obj;
        return newObj;
      }
    }
    function _extends() {
      _extends = Object.assign || function(target) {
        for (var i = 1; i < arguments.length; i++) {
          var source = arguments[i];
          for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
              target[key] = source[key];
            }
          }
        }
        return target;
      };
      return _extends.apply(this, arguments);
    }
    function _inheritsLoose(subClass, superClass) {
      subClass.prototype = Object.create(superClass.prototype);
      subClass.prototype.constructor = subClass;
      subClass.__proto__ = superClass;
    }
    var TrackVisibility = function(_PureComponent) {
      _inheritsLoose(TrackVisibility2, _PureComponent);
      function TrackVisibility2(props) {
        var _this;
        _this = _PureComponent.call(this, props) || this;
        _this.isVisible = function(_ref, windowWidth, windowHeight) {
          var top = _ref.top, left = _ref.left, bottom = _ref.bottom, right = _ref.right, width = _ref.width, height = _ref.height;
          var _this$props = _this.props, offset = _this$props.offset, partialVisibility = _this$props.partialVisibility;
          if (top + right + bottom + left === 0) {
            return false;
          }
          var topThreshold = 0 - offset;
          var leftThreshold = 0 - offset;
          var widthCheck = windowWidth + offset;
          var heightCheck = windowHeight + offset;
          return partialVisibility ? top + height >= topThreshold && left + width >= leftThreshold && bottom - height <= heightCheck && right - width <= widthCheck : top >= topThreshold && left >= leftThreshold && bottom <= heightCheck && right <= widthCheck;
        };
        _this.isComponentVisible = function() {
          setTimeout(function() {
            if (!_this.nodeRef || !_this.nodeRef.getBoundingClientRect) return;
            var html = document.documentElement;
            var once = _this.props.once;
            var boundingClientRect = _this.nodeRef.getBoundingClientRect();
            var windowWidth = window.innerWidth || html.clientWidth;
            var windowHeight = window.innerHeight || html.clientHeight;
            var isVisible = _this.isVisible(boundingClientRect, windowWidth, windowHeight);
            if (isVisible && once) {
              _this.removeListener();
            }
            _this.setState({
              isVisible
            });
          }, 0);
        };
        _this.setNodeRef = function(ref) {
          return _this.nodeRef = ref;
        };
        _this.ownProps = Object.keys(TrackVisibility2.propTypes);
        _this.state = {
          isVisible: false
        };
        _this.throttleCb = (0, _lodash.default)(_this.isComponentVisible, _this.props.throttleInterval);
        props.nodeRef && _this.setNodeRef(props.nodeRef);
        return _this;
      }
      var _proto = TrackVisibility2.prototype;
      _proto.componentDidMount = function componentDidMount() {
        this.attachListener();
        this.isComponentVisible();
      };
      _proto.componentDidUpdate = function componentDidUpdate(prevProps) {
        if (!(0, _shallowequal.default)(this.getChildProps(this.props), this.getChildProps(prevProps))) {
          this.isComponentVisible();
        }
      };
      _proto.componentWillUnmount = function componentWillUnmount() {
        this.removeListener();
      };
      _proto.attachListener = function attachListener() {
        window.addEventListener("scroll", this.throttleCb);
        window.addEventListener("resize", this.throttleCb);
      };
      _proto.removeListener = function removeListener() {
        window.removeEventListener("scroll", this.throttleCb);
        window.removeEventListener("resize", this.throttleCb);
      };
      _proto.getChildProps = function getChildProps(props) {
        var _this2 = this;
        if (props === void 0) {
          props = this.props;
        }
        var childProps = {};
        Object.keys(props).forEach(function(key) {
          if (_this2.ownProps.indexOf(key) === -1) {
            childProps[key] = props[key];
          }
        });
        return childProps;
      };
      _proto.getChildren = function getChildren() {
        var _this3 = this;
        if (typeof this.props.children === "function") {
          return this.props.children(_extends({}, this.getChildProps(), {
            isVisible: this.state.isVisible
          }));
        }
        return _react.default.Children.map(this.props.children, function(child) {
          return _react.default.cloneElement(child, _extends({}, _this3.getChildProps(), {
            isVisible: _this3.state.isVisible
          }));
        });
      };
      _proto.render = function render() {
        var _this$props2 = this.props, className = _this$props2.className, style = _this$props2.style, nodeRef = _this$props2.nodeRef, Tag = _this$props2.tag;
        var props = _extends({}, className && {
          className
        }, style && {
          style
        });
        return _react.default.createElement(Tag, _extends({
          ref: !nodeRef && this.setNodeRef
        }, props), this.getChildren());
      };
      return TrackVisibility2;
    }(_react.PureComponent);
    exports.default = TrackVisibility;
    TrackVisibility.propTypes = {
      /**
       * Define if the visibility need to be tracked once
       */
      once: _propTypes.default.bool,
      /**
       * Tweak the throttle interval
       * Check https://css-tricks.com/debouncing-throttling-explained-examples/ for more details
       */
      throttleInterval: function throttleInterval(props, propName, component) {
        var currentProp = props[propName];
        if (!Number.isInteger(currentProp) || currentProp < 0) {
          return new Error("The " + propName + " prop you provided to " + component + " is not a valid integer >= 0.");
        }
        return null;
      },
      /**
       * Pass one or more children to track
       */
      children: _propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.element, _propTypes.default.arrayOf(_propTypes.default.element)]),
      /**
       * Additional style to apply
       */
      style: _propTypes.default.object,
      /**
       * Additional className to apply
       */
      className: _propTypes.default.string,
      /**
       * Define an offset. Can be useful for lazy loading
       */
      offset: _propTypes.default.number,
      /**
       * Update the visibility state as soon as a part of the tracked component is visible
       */
      partialVisibility: _propTypes.default.bool,
      /**
       * Exposed for testing but allows node other than internal wrapping <div /> to be tracked
       * for visibility
       */
      nodeRef: _propTypes.default.object,
      /**
       * Define a custom tag
       */
      tag: _propTypes.default.string
    };
    TrackVisibility.defaultProps = {
      once: false,
      throttleInterval: 150,
      offset: 0,
      partialVisibility: false,
      tag: "div"
    };
  }
});

// node_modules/react-on-screen/lib/index.js
var require_lib = __commonJS({
  "node_modules/react-on-screen/lib/index.js"(exports) {
    exports.__esModule = true;
    exports.default = void 0;
    var _TrackVisibility = _interopRequireDefault(require_TrackVisibility());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var _default = _TrackVisibility.default;
    exports.default = _default;
  }
});
export default require_lib();
//# sourceMappingURL=react-on-screen.js.map
