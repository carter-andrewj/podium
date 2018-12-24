import React, { Component } from 'react';




class Fader extends Component {

	constructor(props) {
		super()
		this.state = {
			hide: true
		}
	}

	componentDidMount() {
		requestAnimationFrame(() => {
			this.setState({ hide: false });
		}, 150);
	}

	render() {

		return (
			<div ref="about" style={{
				opacity: this.state.hide ? 0.0 : 1.0,
				transition: '0.9s ease-in-out'
				}}>
				{this.props.children}
			</div>
		);
	}

}

export default Fader;