import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { Map, fromJS } from 'immutable';

import Slider from '../core/widgets/slider';




class Login extends Component {

	constructor(props) {
		super()
		this.state = {
			data: Map(fromJS({
				login: false,
				loginLock: false,
				loading: false,
				error: null,
				exit: false,
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
					.then(result => this.exit(result))
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
							console.error(error)
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


	render() {

		const showLogin = (
			this.state.data.get("login") ||
			this.state.data.get("loginLock")
		);

		const loading = this.state.data.get("loading");
		const exit = this.state.data.get("exit");

		return (
			<div ref="login" className="lobby-box">

				<div className="content-holder">
					<div className="content-column">
						{this.props.children}
					</div>
				</div>

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
									onKeyDown={this.resetError.bind(this)}
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
									onKeyDown={this.resetError.bind(this)}
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
						<Link
							to="/register"
							innerRef={ref => this.regRoute = ref}
							style={{ display: "none" }}
						/>
						<div
							className="join-button"
							onClick={() => this.regRoute.click()}>
							sign up
						</div>
						<div
							className="join-suffix"
							onClick={() => this.regRoute.click()}>
							<span className="fas fa-user-plus signin-icon"></span> 
						</div>
					</div>
				</Slider>

			</div>
		);
	}

}

export default Login;