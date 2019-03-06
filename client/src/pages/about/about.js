import React from 'react';
import ImmutableComponent from '../../components/immutableComponent';

import Slider from '../../components/animators/slider';



class About extends ImmutableComponent {

	render() {
		return <div className="aboutpage content">
			<Slider
				position="relative"
				offset={{ x: 0, y: 50 }}
				exit={this.props.exit}>
				<div className="aboutcard card">
					about
				</div>
			</Slider>
		</div>
	}
	
}

export default About;