import React, { PureComponent, PropTypes } from "react";
import "./Workers.css";
import { connect } from "react-redux";

export class Workers extends PureComponent {
  renderWorkers(workers) {
    return(
      workers.map(w => <div className="worker" key={w.url}>{w.url}</div>)
    );
  }

  renderNoWorkersPlaceholder() {
    return (
      <div className="pane-info">
        { L10N.getStr("noWorkersText") }
      </div>
    );
  }

  render() {
    const { workers } = this.props;
    return (
      <div className="pane workers-list">
        { workers && workers.length > 0
          ? this.renderWorkers(workers)
          : this.renderNoWorkersPlaceholder() }
      </div>
    );
  }
}

Workers.displayName = "Workers";
Workers.propTypes = {
  workers: PropTypes.array.isRequired
};

function mapStateToProps(state) {
  return { workers: state.debuggee.workers };
}
export default connect(mapStateToProps)(Workers);
