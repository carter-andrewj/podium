import React, { Component } from 'react';





class Register extends Component {

	constructor(props) {
		super();
		this.register = this.register.bind(this);
	}


	register() {

		// Get data from form
		const id = this.refs.username.value;
		const pw = this.refs.password.value;
		const name = this.refs.displayname.value;

		// Validate input data

		// Dispatch to registration process
		this.props.registerUser(id, pw, name);

	}


	render() {

		return (
			<div ref="register" className="lobby-box">
				<div className="login-box card">
					<p className="title lobby-title">
						Create an Account
					</p>
					<input
						ref="username"
						className="signin-box"
						placeholder="@Username..."
					/>
					<input
						ref="password"
						className="signin-box password-box"
						placeholder="Password..."
					/>
					<input
						ref="displayname"
						className="signin-box password-box"
						placeholder="Display name..."
					/>
					<button
						className="def-button green-button signin-button"
						onClick={this.register.bind(this)}>
						sign-up
					</button>
					<div className="lobby-or">
						<p className="lobby-or-text">OR</p>
					</div>
					<button
						className="def-button red-button lobbymode-button"
						onClick={this.props.setLobbyMode.bind(this, "login")}>
						<span className="fa fa-close"></span> cancel
					</button>
				</div>
			</div>
		);

	}

}

export default Register;