import React, { Component } from 'react';


class Loading extends Component {

	render() {
		return (
			<div ref="loading" className="loader">
				<div className="loader-box">
					<div className="loader-holder">
						<img
							className="loader-image loader-grey"
							src="./images/icon-grey.png"
							alt=""
						/>
						<img
							className="loader-image loader-red"
							src="./images/icon-red-overlay.png"
							alt=""
						/>
						<img
							className="loader-image loader-green"
							src="./images/icon-green-overlay.png"
							alt=""
						/>
					</div>
				</div>
			</div>
		);
	}

}

export default Loading;
