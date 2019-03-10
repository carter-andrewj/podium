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
					delayIn={1.2}
					exit={this.props.exit}>
					<div className="demo-label">
						LIVE ALPHA
					</div>
					<div className="demo-disclaimer">
						This early, incomplete version of the
						Podium social network is under active development.<br/>
						As such, you may experience bugs and errors. We recommend
						using Chrome on a desktop machine to minimize this risk.<br/>
						A list of known bugs can be found{" "}
						<Link to="/bugs/">here</Link>
						{" "}and we greatly appreciate new ones being reported to{" "}
						<a href="mailto:bugs@podium-network.com">
							bugs@podium-network.com
						</a>.
					</div>
				</Fader>
				
				<Fader
					timeIn={1.5}
					exit={this.props.exit}>
					<div className="lobby-image">
						<div className="lobby-image-top">
							<img
								className="lobby-logo-compass"
								src="./images/compass.png"
								alt=""
							/>
							<div className="lobby-icon-holder">
								<img
									className="lobby-logo-icon"
									src="./images/icon.png"
									alt=""
								/>
							</div>
						</div>
						<div className="lobby-image-bottom">
							<img
								className="lobby-logo-text"
								src="./images/logotext-white.png"
								alt=""
							/>
						</div>
					</div>
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
