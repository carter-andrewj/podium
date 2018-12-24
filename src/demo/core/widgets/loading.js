import React, { Component } from 'react';


class Loading extends Component {

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
