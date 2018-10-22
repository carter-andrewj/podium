import React, { Component } from 'react';
import '../../App.css';




class DemoIntro extends Component {

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
		}, 100);
	}

	render() {

		return (
			<div ref="demo-intro" style={{
				opacity: this.state.hide ? 0.0 : 1.0,
				transition: '0.9s ease-in-out'
				}}>
				<p className="title">Live Demo</p>
				<p>
					The following demo is in its early stages of development. As
					such, it currently does not support mobile devices and may
					exhibit unexpected behaviour in browsers other than Chrome.
				</p>
				<button
					className="def-button green-button"
					onClick={this.props.setMode.bind(this, "demo")}>
					<span className="fa fa-rocket" aria-hidden="true"></span> continue
				</button>
				<button
					className="def-button red-button back-button"
					onClick={this.props.setHomeMode.bind(this, "menu")}>
					<span className="fa fa-arrow-circle-left" aria-hidden="true"></span> back
				</button>
			</div>
		);
	}

}

export default DemoIntro;