import React, { Component } from 'react';

import Slider from '../widgets/slider';


class Placeholder extends Component {

	render() {
		return (
			<div className="placeholder">
				<Slider
					direction="top"
					position="fixed"
					time={0.6}>
					<div className="card placeholder-card">
						<div className="placeholder-title-holder">
							<p className="placeholder-title-text">
								{this.props.title}
							</p>
						</div>
						<p className="placeholder-notice">
							under construction
						</p>
						<div className="placeholder-icon-holder">
							<i className={`fas fa-${this.props.icon} placeholder-icon`} />
						</div>
						<div className="placeholder-text-holder">
							{this.props.text}
						</div>
					</div>
				</Slider>
			</div>
		);
	}
}

export default Placeholder;
