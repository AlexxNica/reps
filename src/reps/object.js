// Dependencies
const React = require("react");
const {
  wrapRender,
} = require("./rep-utils");
const Caption = React.createFactory(require("./caption"));
const PropRep = React.createFactory(require("./prop-rep"));
const { MODE } = require("./constants");
// Shortcuts
const { span } = React.DOM;
/**
 * Renders an object. An object is represented by a list of its
 * properties enclosed in curly brackets.
 */
const Obj = React.createClass({
  displayName: "Obj",

  propTypes: {
    object: React.PropTypes.object.isRequired,
    // @TODO Change this to Object.values once it's supported in Node's version of V8
    mode: React.PropTypes.oneOf(Object.keys(MODE).map(key => MODE[key])),
    objectLink: React.PropTypes.func,
    title: React.PropTypes.string,
  },

  getTitle: function (object) {
    let title = this.props.title || object.class || "Object";
    return this.safeObjectLink({className: "objectTitle"}, title);
  },

  safePropIterator: function (object, max) {
    max = (typeof max === "undefined") ? 3 : max;
    try {
      return this.propIterator(object, max);
    } catch (err) {
      console.error(err);
    }
    return [];
  },

  propIterator: function (object, max) {
    let isInterestingProp = (t, value) => {
      // Do not pick objects, it could cause recursion.
      return (t == "boolean" || t == "number" || (t == "string" && value));
    };

    // Work around https://bugzilla.mozilla.org/show_bug.cgi?id=945377
    if (Object.prototype.toString.call(object) === "[object Generator]") {
      object = Object.getPrototypeOf(object);
    }

    // Object members with non-empty values are preferred since it gives the
    // user a better overview of the object.
    let propsArray = this.getPropsArray(object, max, isInterestingProp);

    if (propsArray.length <= max) {
      // There are not enough props yet (or at least, not enough props to
      // be able to know whether we should print "more…" or not).
      // Let's display also empty members and functions.
      propsArray = propsArray.concat(this.getPropsArray(object, max, (t, value) => {
        return !isInterestingProp(t, value);
      }));
    }

    if (propsArray.length > max) {
      propsArray.pop();
      let objectLink = this.props.objectLink || span;

      propsArray.push(Caption({
        object: objectLink({
          object: object
        }, (Object.keys(object).length - max) + " more…")
      }));
    } else if (propsArray.length > 0) {
      // Remove the last comma.
      propsArray[propsArray.length - 1] = React.cloneElement(
        propsArray[propsArray.length - 1], { delim: "" });
    }

    return propsArray;
  },

  getPropsArray: function (object, max, filter) {
    let propsArray = [];

    max = max || 3;
    if (!object) {
      return propsArray;
    }

    // Hardcode tiny mode to avoid recursive handling.
    let mode = MODE.TINY;

    try {
      for (let name in object) {
        if (propsArray.length > max) {
          return propsArray;
        }

        let value;
        try {
          value = object[name];
        } catch (exc) {
          continue;
        }

        let t = typeof value;
        if (filter(t, value)) {
          propsArray.push(PropRep({
            mode: mode,
            name: name,
            object: value,
            equal: ": ",
            delim: ", ",
          }));
        }
      }
    } catch (err) {
      console.error(err);
    }

    return propsArray;
  },

  safeObjectLink: function (config, ...children) {
    if (this.props.objectLink) {
      return this.props.objectLink(Object.assign({
        object: this.props.object
      }, config), ...children);
    }

    if (Object.keys(config).length === 0 && children.length === 1) {
      return children[0];
    }

    return span(config, ...children);
  },

  render: wrapRender(function () {
    let object = this.props.object;
    let propsArray = this.safePropIterator(object);

    if (this.props.mode === MODE.TINY || !propsArray.length) {
      return (
        span({className: "objectBox objectBox-object"},
          this.getTitle(object)
        )
      );
    }

    return (
      span({className: "objectBox objectBox-object"},
        this.getTitle(object),
        this.safeObjectLink({
          className: "objectLeftBrace",
        }, " { "),
        ...propsArray,
        this.safeObjectLink({
          className: "objectRightBrace",
        }, " }")
      )
    );
  }),
});
function supportsObject(object, type) {
  return true;
}

// Exports from this module
module.exports = {
  rep: Obj,
  supportsObject: supportsObject
};
