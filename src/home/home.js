import React, { Component } from 'react';
import { Map, fromJS } from 'immutable';

import Menu from './menu';
import About from './about';
import DemoIntro from './demo-intro';
import Materials from './materials';
import Contact from './contact';




class Home extends Component {

	constructor() {
		super()
		this.state = {
			data: Map(fromJS({
				mode: "menu"
			}))
		}
		this.setHomeMode = this.setHomeMode.bind(this);
	}

	updateState(up, callback) {
		this.setState(
			({data}) => { return {data: up(data)} },
			callback
		);
	}

	setHomeMode(mode) {
		this.updateState(state => state
			.set("mode", mode)
		);
	}

	render() {

		let content;
		switch (this.state.data.get("mode")) {

			// Show the About page
			case ("about"):
				content = <About
					setHomeMode={this.setHomeMode}
				/>
				break;

			// Show the demo intro page
			case ("demo"):
				content = <DemoIntro
					setHomeMode={this.setHomeMode}
					setMode={this.props.setMode}
				/>
				break;

			// Show the materials page
			case ("materials"):
				content = <Materials
					setHomeMode={this.setHomeMode}
				/>
				break;

			// Show the Contact page
			case ("contact"):
				content = <Contact
					setHomeMode={this.setHomeMode}
				/>
				break;

			// Show the page menu
			case ("menu"):
				content = <Menu
					setHomeMode={this.setHomeMode}
				/>
				break;

			default:
				this.setHomeMode.bind(this, "menu");
				content = <Menu
					setHomeMode={this.setHomeMode}
				/>

		}

		// Render the complete page
		return (
			<div className="home container">
				<div className="row">
					<div className="icon-panel col">
						<img
							className="compass"
							src="./images/compass.png"
							alt=""
						/>
						<img
							className="icon"
							src="./images/icon.png"
							alt=""
						/>
					</div>
					<div className="main-panel col">
						{content}
					</div>
				</div>
				<div className="row footer">
					<p className="col footer-text">
						a social network with integrity
					</p>
				</div>
			</div>
		);

	}
}

export default Home;