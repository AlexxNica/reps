const React = require("react");
const { DOM: dom, PropTypes, createFactory } = React;
const ImPropTypes = require("react-immutable-proptypes");

const Result = createFactory(require("./Result"));

const ResultsList = React.createClass({
  displayName: "ResultsList",

  propTypes: {
    expressions: ImPropTypes.map.isRequired,
    showResultPacket: PropTypes.func.isRequired,
    hideResultPacket: PropTypes.func.isRequired,
  },

  render: function () {
    let {
      expressions,
      showResultPacket,
      hideResultPacket,
    } = this.props;

    return dom.div({ className: "expressions" },
      expressions
        .entrySeq()
        .toJS()
        .map(([ key, expression ]) =>
          Result({
            key,
            expression: expression.toJS(),
            showResultPacket: () => showResultPacket(key),
            hideResultPacket: () => hideResultPacket(key),
          })
         )
    );
  }
});

module.exports = ResultsList;
