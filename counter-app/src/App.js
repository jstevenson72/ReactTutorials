import React, { Component } from 'react';
import Navbar from './components/navbar';
import Counters from './components/counters';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  state = {
    counters: [
      { id: 1, value: 4 },
      { id: 2, value: 0 },
      { id: 3, value: 0 },
      { id: 4, value: 0 },
    ]
  };

  constructor(){
    super();
    console.log("App Constructor");
  }

  componentDidMount(){
    //this.setState({movies})
    console.log("App Mounted");
  }

  handleDelete = (counter) => {
    console.log("Event Handler Called", counter.id);
    const counters = this.state.counters.filter((co) => co.id !== counter.id);
    this.setState({ counters });
  };

  handleReset = () => {
    const counters = this.state.counters.map((c) => {
      c.value = 0;
      return c;
    });

    this.setState(counters);
  };

  handleIncrement = (counter) => {
    const counters = [...this.state.counters];
    counters[counters.indexOf(counter)].value++;
    this.setState(counters);
  };

  render() {
    console.log("App Rendered");
    return (
      <React.Fragment>
      <Navbar totalCounters={this.state.counters.filter(c=> c.value>0).length}/>
      <main className='container'>
        <Counters onReset={this.handleReset} onDelete={this.handleDelete} onIncrement={this.handleIncrement} counters={this.state.counters} />
      </main>
      </React.Fragment>
    );
  };

}


export default App;