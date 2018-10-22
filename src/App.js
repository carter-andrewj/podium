import React, { Component } from 'react';
import './App.css';

import Home from './components/home/home'
import Demo from './components/demo/demo'
import Faq from './components/faq/faq'




class App extends Component {

	constructor() {
		super()
		this.state = {
			mode: "demo",
			window: {
				width: 0,
				height: 0,
				font: 0
			}
		}
		this.setMode = this.setMode.bind(this);
		this.setGlobals = this.setGlobals.bind(this);
		this.handleResize = this.handleResize.bind(this);
	}

	setMode(mode) {
		this.setState({
			mode: mode,
			window: this.state.window
		});
	}

	componentDidMount() {
		this.setGlobals();
		window.addEventListener('resize', this.handleResize);
	}


	setGlobals() {
		this.setState({
			mode: this.state.mode,
			window: {
				width: window.innerWidth,
				height: window.innerHeight,
				font: 8 + (window.innerHeight * 0.01)
			}
		});
	}

	
	handleResize() {
		this.setGlobals();
	}


	render() {

		// Return homepage or demo page
		let content;
		switch (this.state.mode) {

			// Display live demo
			case "demo":
				content = <Demo
					user = {this.state.user}
					posts = {this.state.posts}
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
