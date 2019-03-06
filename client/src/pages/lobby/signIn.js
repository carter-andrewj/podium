import React from 'react';
import ImmutableComponent from '../../components/immutableComponent';

import MiniLoader from '../../components/miniLoader';



let timer;

class SignIn extends ImmutableComponent {

	constructor() {
		super({
			login: false,
			loginLock: false,
			loading: false,
			error: null
		})
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

			// Blur focus
			this.username.blur()
			this.password.blur()

			// Sign the user in
			this.updateState(
				state => state
					.set("error", null)
					.set("loading", true),
				() => this.props
					.signIn(id, pw)
					.then(callback => this.props.transition(callback, false, true))
					.catch(error => {
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



	showAt() {
		this.lock()
		this.updateState(state => state.set("at", true))
	}


	hideAt() {
		this.unlock()
		if (this.username.value === "") {
			this.updateState(state => state.set("at", false))
		}
	}


	show() {
		clearTimeout(timer)
		timer = setTimeout(
			() => {
				this.updateState(state => state.set("show", true))
				if (!this.getState("lock")) { this.username.focus() }
			},
			150
		)
	}


	hide() {
		clearTimeout(timer)
		this.updateState(state => state.set("show", false))
	}


	lock() {
		this.updateState(state => state.set("lock", true))
	}


	unlock() {
		if (this.username.value === "" &&
				this.password.value === "") {
			this.updateState(state => state
				.set("lock", false))
		}
	}


	resetError(event) {
		this.updateState(state => state.set("error", null))
	}


	render() {

		const show = this.getState("show") || this.getState("lock")
		const error = this.getState("error") ? true : false
		const loading = this.getState("loading")
		let filled;
		if (this.username && this.password) {
			filled = this.username.value !== "" && this.password.value !== ""
		}

		return (
			<div
				className={show ? 
					"signin-capture signin-capture-open" :
					"signin-capture signin-capture-closed"
				}
				onMouseEnter={this.show.bind(this)}
				onMouseLeave={this.hide.bind(this)}>

				<div className="card signin">

					<div className="signin-error">
						{this.getState("error")}
					</div>

					<form onSubmit={this.signIn.bind(this)}>

						<div
							className={show ?
								"signin-icon-holder signin-icon-holder-open" :
								"signin-icon-holder signin-icon-holder-closed"
							}
							onClick={() => this.username.focus()}>
							<span className="signin-caption">sign in</span>
							<i className="fas fa-sign-in-alt signin-icon" />
						</div>

						<div
							className={show ?
								"signin-label-holder signin-label-holder-open" :
								"signin-label-holder signin-label-holder-closed"
							}>
							<p
								className={error ?
									"signin-at signin-at-error" :
									(this.getState("at") && this.username && this.username.value !== "") ?
										"signin-at signin-at-on" :
										"signin-at signin-at-off"
								}
								onClick={() => this.username.focus()}>
								@
							</p>
						</div>

						<input
							ref={ref => this.username = ref}
							className={
								!show ? "signin-box signin-box-id signin-box-closed" :
								error ? "signin-box signin-box-id signin-box-open signin-box-error" :
								(this.username && this.username.value !== "") ?
									"signin-box signin-box-id signin-box-open signin-box-filled" :
									"signin-box signin-box-id signin-box-open"
							}
							placeholder="Username..."
							onFocus={loading ?
								() => this.username.blur() :
								this.showAt.bind(this)
							}
							onBlur={this.hideAt.bind(this)}
							onKeyPress={this.resetError.bind(this)}
							onKeyDown={this.resetError.bind(this)}
						/>

						<input
							ref={ref => this.password = ref}
							className={
								!show ? "signin-box signin-box-password signin-box-closed" :
								error ? "signin-box signin-box-password signin-box-open signin-box-error" :
								(this.password && this.password.value !== "") ?
									"signin-box signin-box-password signin-box-open signin-box-filled" :
									"signin-box signin-box-password signin-box-open"
							}
							placeholder="Password..."
							type="password"
							onFocus={loading ?
								() => this.password.blur() :
								this.lock.bind(this)
							}
							onBlur={this.unlock.bind(this)}
							onKeyPress={this.resetError.bind(this)}
							onKeyDown={this.resetError.bind(this)}
						/>

						<div
							className={
								!show ? "card signin-button signin-button-hide" :
								error ? "card signin-button signin-button-error" :
								loading ? "card signin-button signin-button-loading" :
								filled ? "card signin-button signin-button-on" :
									"card signin-button signin-button-off"
							}
							onClick={(filled && !loading && !error) ?
								this.signIn.bind(this) :
								() => this.username.focus()
							}>
							{error ?
								<i className="fas fa-exclamation signin-button-icon" />
								:
								loading ?
									<MiniLoader size={0.8} />
									:
									<i className="fas fa-sign-in-alt signin-button-icon" />
							}
						</div>
						<button
							type="submit"
							style={{ display: "none" }}
						/>

					</form>

					{loading ?
						<div className="signin-loading-mask" />
						: null
					}

				</div>

			</div>
		)
	}


	immutableComponentWillUnmount() {
		clearTimeout(timer)
	}


}

export default SignIn;
