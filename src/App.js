import React, { Component } from 'react';
import { Map, fromJS } from 'immutable';
import 'App.css';

import Home from 'home/home'
import Demo from 'demo/demo'
import Faq from 'faq/faq'




class App extends Component {

	constructor() {
		super()
		this.state = {
			data: Map(fromJS({
				mode: "demo",
				window: {
					width: 0,
					height: 0,
					font: 0
				}
			}))
		}
		this.setMode = this.setMode.bind(this);
		this.setGlobals = this.setGlobals.bind(this);
		this.handleResize = this.handleResize.bind(this);
	}


	updateState(up, callback) {
		this.setState(
			({data}) => { return {data: up(data)} },
			callback
		);
	}


	setMode(mode) {
		this.updateState(state => state.set("mode", mode));
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
				font: 8 + (window.innerHeight * 0.01)
			}))
		);
	}

	
	handleResize() {
		this.setGlobals();
	}


	render() {

		// Return homepage or demo page
		let content;
		switch (this.state.data.get("mode")) {

			// Display live demo
			case "demo":
				content = <Demo
					setMode = {this.setMode}
				/>
				break;

			// Display the faq
			case "faq":
				content = <Faq />
				break;

			// Default to the home page
			default:
				content = <Home
					setMode={this.setMode}
				/>;
		}

		return (
			<div className="App">
				{content}
			</div>
		);

	}


	componentWillUnmount() {
		window.removeEventListener('resize', this.handleResize);
	}

}

export default App;
