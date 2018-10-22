import React, { Component } from 'react';
import '../../App.css';




class Materials extends Component {

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
			<div ref="materials" style={{
				opacity: this.state.hide ? 0.0 : 1.0,
				transition: '0.9s ease-in-out'
				}}>
				<p className="title">Investor Materials</p>
				<p>
					As a new start-up, Podium will soon begin seeking seed
					investment. The Podium team is currently hard at work refining
					our live prototype and compiling a slate of investor materials
					we will make available in the coming months.
				</p>
				<p>
					In the meantime, if you would like to register your interest
					or start a conversation, please don't hesitate to <a
						className="textlink"
						onClick={this.props.setHomeMode.bind(this, "contact")}>
						get in touch
					</a>.
				</p>
				<button
					className="def-button grey-button inline-button">
					1-pager
					<p className="subtext">coming soon</p>
				</button>
				<button
					className="def-button grey-button inline-button">
					intro deck
					<p className="subtext">coming soon</p>
				</button>
				<button
					className="def-button grey-button inline-button">
					valuation deck
					<p className="subtext">coming soon</p>
				</button>
				<button
					className="def-button grey-button inline-button">
					whitepaper
					<p className="subtext">coming soon</p>
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

export default Materials;