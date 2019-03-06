import React from 'react';
import ImmutableComponent from './immutableComponent';


class Loader extends ImmutableComponent {

	render() {
		return (
			<div className="loader">
				<div className="loader-image-holder">
					<img
						className="loader-image-compass"
						src="/images/compass.png"
						alt=""
					/>
					<img
						className="loader-image-icon"
						src="/images/icon.png"
						alt=""
					/>
				</div>
				<div className="loader-message-holder">
					<p className="loader-message">
						{this.props.message}
					</p>
				</div>
			</div>
		)
	}

}

export default Loader;
