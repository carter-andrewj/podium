import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import ImmutableComponent from '../../components/immutableComponent';

import SignIn from './signIn';
import Register from './register';

import Slider from '../../components/animators/slider';
import Fader from '../../components/animators/fader';




class _LobbyHUD extends ImmutableComponent {

	constructor() {
		super({
			hideHome: false
		})
		this.hideHome = this.hideHome.bind(this)
		this.showHome = this.showHome.bind(this)
	}

	hideHome() {
		this.updateState(state => state.set("hideHome", true))
	}

	showHome() {
		this.updateState(state => state.set("hideHome", false))
	}

	render() {
		const showHome =
			this.props.location.pathname !== "/" &&
			this.props.location.pathname !== "/about"
		return (
			<div className="master-layout">
				
				<div className="sidebar">
					<div className="sidebar-column sidebar-left">
						<Fader
							delayIn={this.ready ? 0.2 : 1.2}
							show={this.ready && !this.props.exit &&
								showHome && !this.getState("hideHome")}>
							<Link
								to="/"
								innerRef={ref => this.homeLink = ref}
								style={{ display: "none" }}
							/>
							<div
								className="home-hud-button card"
								onClick={() => this.props.transition(
									() => this.homeLink.click()
								)}>
								<i className="fas fa-home home-hud-button-icon" />
							</div>
						</Fader>
						<Slider
							offset={{ x: -20, y: 0 }}
							delayIn={1.0}
							exit={this.props.exit}>
							<Register
								podium={this.props.podium}
								registerUser={this.props.registerUser}
								transition={this.props.transition}
								hideHome={this.hideHome}
								showHome={this.showHome}
							/>
						</Slider>
					</div>
				</div>

				<div className="content-holder">
					<div className="content-column">
						{this.props.children}
					</div>
				</div>

				<div className="sidebar">
					<div className="sidebar-column sidebar-right">
						<Fader
							delayIn={1.2}
							show={this.ready && !this.props.exit && showHome}>
							<Link
								to="/about"
								innerRef={ref => this.aboutLink = ref}
								style={{ display: "none" }}
							/>
							<div
								className="about-hud-button card"
								onClick={() => this.props.transition(
									() => this.aboutLink.click()
								)}>
								<i className="fas fa-question about-hud-button-icon" />
							</div>
						</Fader>
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

const LobbyHUD = withRouter(_LobbyHUD);

export default LobbyHUD;
