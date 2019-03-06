import React from 'react';
import ImmutableComponent from '../components/immutableComponent';

import Slider from '../components/animators/slider';


class Placeholder extends ImmutableComponent {

	render() {
		return (
			<div className="placeholder content">
				<Slider
					offset={{ x: 0, y: -100 }}
					units="vh"
					exit={this.props.exit}>
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
						<div className="placeholder-text-box">
							<div className="placeholder-text-holder">
								{this.props.text}
							</div>
							<div className="placeholder-gradient placeholder-gradient-top" />
							<div className="placeholder-gradient placeholder-gradient-bottom" />
						</div>
					</div>
				</Slider>
			</div>
		);
	}
}

export default Placeholder;
