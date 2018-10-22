import React, { Component } from 'react';
import '../../App.css';




class Menu extends Component {

	constructor(props) {
		super()
		this.state = {
			hide: true
		}
	}

	componentDidMount() {
		requestAnimationFrame(() => {
			this.setState({
				hide: false
			});
		}, 150);
	}

	render() {

		return (
			<div ref="menu" style={{
				opacity: this.state.hide ? 0.0 : 1.0,
				transition: '0.9s ease-in-out'
				}}>
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
			</div>
		);
	}

}

export default Menu;

