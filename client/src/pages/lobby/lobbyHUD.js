import React from 'react';
import ImmutableComponent from '../../components/immutableComponent';

import SignIn from './signIn';
import Register from './register';

import Slider from '../../components/animators/slider';




class LobbyHUD extends ImmutableComponent {

	render() {
		return (
			<div className="master-layout">
				
				<div className="sidebar sidebar-left">
					<div className="sidebar-column">
						<Slider
							offset={{ x: -20, y: 0 }}
							delayIn={1.0}
							exit={this.props.exit}>
							<Register
								podium={this.props.podium}
								registerUser={this.props.registerUser}
								transition={this.props.transition}
							/>
						</Slider>
					</div>
				</div>

				<div className="content-holder">
					<div className="content-column">
						{this.props.children}
					</div>
				</div>

				<div className="sidebar sidebar-right">
					<div className="sidebar-column">
						<Slider
							offset={{ x: 20, y: 0 }}
							delayIn={1.0}
							exit={this.props.exit}>
							<SignIn
								signIn={this.props.signIn}
								transition={this.props.transition}
							/>
						</Slider>
					</div>
				</div>

			</div>
		)
	}

}

export default LobbyHUD;
