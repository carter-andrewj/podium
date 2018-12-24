import React, { Component } from 'react';

import Fader from './fader';




class Menu extends Component {

	render() {

		return (
			<Fader>
				<img
					className="logo"
					src="./images/logo.png"
					alt=""
				/>
				<button
					id="menu-about"
					className="def-button green-button"
					onClick={this.props.setHomeMode.bind(this, "about")}>
					<span className="fa fa-info-circle" aria-hidden="true"></span> about
				</button>
				<button
					id="menu-demo"
					className="def-button red-button"
					onClick={this.props.setHomeMode.bind(this, "demo")}>
					<span className="fa fa-rocket" aria-hidden="true"></span> demo
				</button>
				<button
					id="menu-materials"
					className="def-button green-button"
					onClick={this.props.setHomeMode.bind(this, "materials")}>
					<span className="fa fa-file-text" aria-hidden="true"></span> materials
				</button>
				<button
					id="menu-contact"
					className="def-button green-button"
					onClick={this.props.setHomeMode.bind(this, "contact")}>
					<span className="fa fa-envelope" aria-hidden="true"></span> contact
				</button>
			</Fader>
		);
	}

}

export default Menu;

