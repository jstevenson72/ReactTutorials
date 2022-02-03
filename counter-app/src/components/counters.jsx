import React, { Component } from "react";
import Counter from "./counter";

class Counters extends Component {
  render() {
    return (
      <div>
        <button
          onClick={this.props.onReset}
          className="bnt btn-primary btn-sm m-2"
        >
          Reset
        </button>
        {this.props.counters.map((c) => (
          <Counter
            key={c.id}
            counter={c}
            onDelete={this.props.onDelete}
            onIncrement={this.props.onIncrement}
          >
            <h4>Counter #{c.id}</h4>
          </Counter>
        ))}
      </div>
    );
  }
}

export default Counters;
