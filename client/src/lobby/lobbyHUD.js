import React from 'react';
import ImmutableComponent from '../core/widgets/immutableComponent';

import SignIn from './signin';
import Register from './register';

import Slider from '../core/widgets/animators/slider';




class LobbyHUD extends ImmutableComponent {

	constructor(props) {
		super()
		this.exit = this.exit.bind(this)
	}


	exit(callback) {
		this.updateState(
			state => state.set("show", false),
			() => setTimeout(callback, 500)
		)
	}


	render() {

		return (
			<div ref="login" className="lobby-box">

				<div className="content-holder">
					<div className="content-column">
						{this.props.children}
					</div>
				</div>
				
				<Slider
					offset={{ x: 8.5, y: 0 }}
					position="fixed"
					time={0.4} delayIn={1.0}>
					<SignIn
						signIn={this.props.signIn}
						exit={this.exit}
					/>
				</Slider>

				<Slider
					offset={{ x: -8.5, y: 0 }}
					position="fixed"
					time={0.4} delayIn={1.0}>
					<Register
						podium={this.props.podium}
						registerUser={this.props.registerUser}
						exit={this.exit}
					/>
				</Slider>

			</div>
		)
	}

}

export default LobbyHUD;