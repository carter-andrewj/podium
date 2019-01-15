import React, { Component } from 'react';
import { Map, fromJS } from 'immutable';

import Slider from '../core/widgets/slider';
import Fader from '../core/widgets/fader';

import { formatNumber } from 'utils';




class Login extends Component {

	constructor(props) {
		super()
		this.state = {
			data: Map(fromJS({
				stats: {
					newUsers: 2132,
					returningUsers: 494294,
					posts: 6294651,
					pod: 1257328427,
					aud: 6372901,
					promoted: 1144838,
					reports: 12327,
					sanctions: 8321
				},
				login: false,
				loginLock: false,
				loading: false,
				error: null,
				exit: false,
				highlight: null
			}))
		}
		this.signIn = this.signIn.bind(this);
	}


	updateState(up, callback) {
		this.setState(
			({data}) => { return {data: up(data)} },
			callback
		);
	}


	signIn(event) {

		// Interrupt normal form submission
		event.preventDefault();

		// Get form data
		const id = this.username.value;
		const pw = this.password.value;

		// Validate username and passsword
		//TODO - More detailed validation of
		//		 username and password
		if (id === "") {
			this.updateState(
				state => state.set("error", "please enter your username"),
				() => this.username.focus()
			)
		} else if (pw === "") {
			this.updateState(
				state => state.set("error", "please enter your password"),
				() => this.password.focus()
			)
		} else {

			// Sign the user in
			this.updateState(
				state => state
					.set("error", null)
					.set("loading", true),
				() => this.props
					.signIn(id, pw)
					.then(result => {
						if (result) { this.exit(result) }
					})
					.catch(error => {
						console.log("ERROR:", error)
						if (error.code === 1 || error.code === 2) {
							this.updateState(state => state
								.set("loading", false)
								.set("error", "incorrect username or password")
							)
						} else {
							this.updateState(state => state
								.set("loading", false)
								.set("error", "unknown error - please try again")
							)
							throw error
						}
					})
			)

		}

	}


	resetError() {
		this.updateState(state => state
			.set("error", null))
	}


	showLogin() {
		this.updateState(state => state
			.set("login", true)
		)
	}


	hideLogin() {
		this.updateState(state => state
			.set("error", null)
			.set("login", false)
		)
	}


	lockLogin() {
		this.updateState(state => state
			.set("loginLock", true))
	}


	unlockLogin() {
		if (this.username.value === "" &&
				this.password.value === "") {
			this.updateState(state => state
				.set("loginLock", false))
		}
	}


	exit(callback) {
		this.updateState(
			state => state.set("exit", true),
			() => setTimeout(callback, 700)
		)
	}


	setMode(mode) {
		this.exit(() => this.props.setLobbyMode(mode))
	}


	highlight(target) {
		this.updateState(state => state
			.set("highlight", target))
	}


	render() {

		const showLogin = (
			this.state.data.get("login") ||
			this.state.data.get("loginLock")
		);

		const loading = this.state.data.get("loading");
		const exit = this.state.data.get("exit");

		return (
			<div ref="login" className="lobby-box">

				<div
					className="login-capture"
					onMouseOver={this.showLogin.bind(this)}
					onMouseLeave={this.hideLogin.bind(this)}>
					<Slider
						direction="left"
						timeIn={1.0} delayIn={1.0}
						timeOut={0.4} delayOut={0.2}
						exit={exit}>
						<div className="card login-box">
							<div className="signin-error">
								{this.state.data.get("error")}
							</div>
							<form onSubmit={this.signIn.bind(this)}>
								<div
									className="signin-prefix"
									onClick={() => this.username.focus()}>
									{(loading) ?
										<img
											className="signin-loading-glyph"
											src="./images/icon-glyph-white.png"
											alt=""
										/> :
										<span className="fas fa-at signin-icon">
										</span>
									}
								</div>
								<input
									ref={ref => this.username = ref}
									className={(showLogin) ?
										"signin-box signin-open" :
										"signin-box signin-closed"
									}
									placeholder="Username..."
									onFocus={(this.state.data.get("loading")) ?
										() => this.username.blur() :
										this.lockLogin.bind(this)
									}
									onBlur={this.unlockLogin.bind(this)}
									onKeyPress={this.resetError.bind(this)}
								/>
								<input
									ref={ref => this.password = ref}
									className={(showLogin) ?
										"signin-box signin-open" :
										"signin-box signin-closed"
									}
									placeholder="Password..."
									type="password"
									onFocus={(this.state.data.get("loading")) ?
										() => this.password.blur() :
										this.lockLogin.bind(this)
									}
									onBlur={this.unlockLogin.bind(this)}
									onKeyPress={this.resetError.bind(this)}
								/>
								<div
									className="signin-button"
									onClick={this.signIn.bind(this)}>
									sign in
								</div>
								<button
									type="submit"
									style={{display: "none"}}
								/>
							</form>
							{(this.state.data.get("loading")) ?
								<div className="signin-loading-mask"></div>
								: null
							}
						</div>
					</Slider>
				</div>

				<Slider
					direction="right"
					timeIn={1.0} delayIn={1.0}
					timeOut={0.4} delayOut={0.2}
					exit={exit}>
					<div className="join-box card">
						<div
							className="join-button"
							onClick={this.setMode.bind(this, "register")}>
							sign up
						</div>
						<div
							className="join-suffix"
							onClick={this.setMode.bind(this, "register")}>
							<span className="fas fa-user-plus signin-icon"></span> 
						</div>
					</div>
				</Slider>

				<Fader
					timeIn={1.5}
					timeOut={0.5}
					exit={exit}>
					<div className="title-box">
						<img
							className="lobby-image"
							src="./images/title-logo.png"
							alt=""
						/>
					</div>
				</Fader>

				<Slider
					direction="bottom"
					timeIn={1.0} delayIn={1.0}
					timeOut={0.4} delayOut={0.2}
					exit={exit}>
					<div className="stat-container">
						<div
							className="stat-box card"
							onMouseOver={this.highlight.bind(this, "stats")}
							onMouseOut={this.highlight.bind(this, null)}>
							{(this.state.data.get("highlight") === "stats") ?
								<div className="stat-caveat">
									public dashboards under construction
								</div>
								: null
							}
							<div className="stat-title">
								Today
							</div>
							<div className="stat-holder">
								<p className="stat-number stat-blue">
									{formatNumber(this.state.data.getIn(["stats", "newUsers"]))}
								</p>
								<p className="stat-label">
									new members
								</p>
							</div>
							<div className="stat-holder">
								<p className="stat-number stat-blue">
									{formatNumber(this.state.data.getIn(["stats", "returningUsers"]))}
								</p>
								<p className="stat-label">
									active users
								</p>
							</div>
							<div className="stat-holder">
								<p className="stat-number stat-green">
									{formatNumber(this.state.data.getIn(["stats", "posts"]))}
								</p>
								<p className="stat-label">
									new posts
								</p>
							</div>
							<div className="stat-holder">
								<p className="stat-number stat-green">
									{formatNumber(this.state.data.getIn(["stats", "pod"]))}
								</p>
								<p className="stat-label">
									POD spent
								</p>
							</div>
							<div className="stat-holder">
								<p className="stat-number stat-purple">
									{formatNumber(this.state.data.getIn(["stats", "aud"]))}
								</p>
								<p className="stat-label">
									AUD spent
								</p>
							</div>
							<div className="stat-holder">
								<p className="stat-number stat-purple">
									{formatNumber(this.state.data.getIn(["stats", "promoted"]))}
								</p>
								<p className="stat-label">
									posts promoted
								</p>
							</div>
							<div className="stat-holder">
								<p className="stat-number stat-red">
									{formatNumber(this.state.data.getIn(["stats", "reports"]))}
								</p>
								<p className="stat-label">
									new reports
								</p>
							</div>
							<div className="stat-holder">
								<p className="stat-number stat-red">
									{formatNumber(this.state.data.getIn(["stats", "sanctions"]))}
								</p>
								<p className="stat-label">
									sanctions
								</p>
							</div>
							<div className="stat-ender">
								<span className="fas fa-chart-bar stat-icon"></span>
							</div>
						</div>
					</div>
				</Slider>

			</div>
		);
	}

}

export default Login;