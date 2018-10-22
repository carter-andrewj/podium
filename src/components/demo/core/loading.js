import React, { Component } from 'react';
import '../../../App.css';

class Loading extends Component {

	constructor() {
		super()
		this.state = {

		}
	}

	render() {
		return (
			<div ref="loading" className="loader">
				<div className="loader-box">
					<img
						className="loader-image"
						src="./images/icon-loader.png"
						alt=""
					/>
				</div>
			</div>
		);
	}
}

export default Loading;
