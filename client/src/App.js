import React, { Component } from 'react';
import { Map, fromJS } from 'immutable';
import 'App.css';

import Podium from './podium'




class App extends Component {

	constructor() {
		super()
		this.state = {
			data: Map(fromJS({
				window: {
					width: 0,
					height: 0,
					font: 0
				}
			}))
		}
		this.setGlobals = this.setGlobals.bind(this);
		this.handleResize = this.handleResize.bind(this);
	}


	updateState(up, callback) {
		this.setState(
			({data}) => { return {data: up(data)} },
			callback
		);
	}


	componentDidMount() {
		this.setGlobals();
		window.addEventListener('resize', this.handleResize);
	}


	setGlobals() {
		this.updateState(state => state
			.set("window", Map({
				width: window.innerWidth,
				height: window.innerHeight,
				font: 8 + (window.innerHeight * 0.013)
			}))
		);
	}

	
	handleResize() {
		this.setGlobals();
	}


	//TODO - Add routing

	render() {
		return (
			<div className="App">
				<Podium />
			</div>
		);
	}


	componentWillUnmount() {
		window.removeEventListener('resize', this.handleResize);
	}

}

export default App;
