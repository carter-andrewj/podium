import React from 'react';
import { Link } from 'react-router-dom';
import ImmutableComponent from '../../components/immutableComponent';

import Fader from '../../components/animators/fader';
import Slider from '../../components/animators/slider';




class Lobby extends ImmutableComponent {

	render() {

		return (
			<div className="lobby content">

				
				<Fader
					timeIn={1.5}
					exit={this.props.exit}>
					<img
						className="lobby-image"
						src="./images/title-logo.png"
						alt=""
					/>
				</Fader>

				<Slider
					offset={{ x: 0, y: 20 }}
					delayIn={3.0}
					exit={this.props.exit}>
					<Link
						to="/about"
						innerRef={ref => this.aboutLink = ref}
						style={{ display: "none" }}
					/>
					<div
						onClick={() => this.props.transition(
							() => this.aboutLink.click()
						)}
						className="about-button card">
						<i className="fas fa-question about-icon" />
					</div>
				</Slider>

			</div>
		)

	}

}

export default Lobby;
