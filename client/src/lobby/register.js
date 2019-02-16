import React from 'react';
import ImmutableComponent from '../core/widgets/immutableComponent';

import { Map, fromJS } from 'immutable';

import Cropper from 'react-easy-crop';




const bioContent = {
	home: [
		" on Mars",
		" in the sea",
		" with a family of ducks",
		" on a prayer, unlike Bryan Adams",
		", if living is without you(ooo-oo)",
		" atop a very tall pole",
		" with Santa",
		" amongst the pixie-folk",
		" for disco",
		" like there's no tomorrow, because there often is"
	],
	own: [
		" shares in an ice-cream mining company",
		" a pterodactyl (yet)",
		" the fountain of youth, I'm just leasing it",
		" all the cars in Sweden",
		" any moons",
		" Antarctica",
		" posessions",
		" the secret of fire",
		" more than one batmobile",
		" that famous thing that got stolen recently.."
	],
	work: [
		" as a shrimp wrangler",
		" for payment in the form of satsumas",
		", I play",
		" properly when dropped in liquid, it voids my warranty",
		" well - I work spectacularly",
		" as a spy... honest",
		" in marketing for a multinational unicorn saddle company",
		" in fish dentistry",
		" as a PA for Elvis",
		" below a temperature of 5 Kelvin"
	],
	other: [
		" play the tuba while cartwheeling",
		" divide by zero",
		" move objects with my mind",
		" deplantricate, because I don't know what that is",
		" become Grand Supreme Ultileader of Canada, apparently",
		" forgive that celebrity for that thing they did last week",
		" conjure giant canaries out of thin air, they were chickens painted yellow",
		" understand why Jack didn't get on the door too, he could clearly fit",
		" juggle cats",
		" write a real Podium bio, so I just used the auto-generated one"
	]
}



const createImage = url =>
	new Promise((resolve, reject) => {
		const image = new Image()
		image.addEventListener('load', () => resolve(image))
		image.addEventListener('error', error => reject(error))
		image.setAttribute('crossOrigin', 'anonymous') // needed to avoid cross-origin issues on CodeSandbox
		image.src = url
	})



async function getCroppedImage(imageSrc, pixelCrop) {
	const image = await createImage(imageSrc)
	const canvas = document.createElement('canvas')
	canvas.width = pixelCrop.width
	canvas.height = pixelCrop.height
	const ctx = canvas.getContext('2d')

	ctx.drawImage(
		image,
		pixelCrop.x,
		pixelCrop.y,
		pixelCrop.width,
		pixelCrop.height,
		0,
		0,
		pixelCrop.width,
		pixelCrop.height
	)

	// As Base64 string 
	return canvas.toDataURL('image/png');

}




let timer;

const reader = new FileReader();



class Register extends ImmutableComponent {

	constructor() {
		super({

			show: false,
			lock: false,
			loading: false,
			error: null,

			at: false,
			target: null,

			imageURL: null,
			image: null,
			imageCrop: { x: 0, y: 0 },
			imageZoom: 1.1,
			imagePixels: null,
			cropping: false,

			valid: false,
			errors: {
				username: null,
				password: null,
				displayName: null
			},

		})
	}


	componentDidMount() {
		const bio = ((Math.random() > 0.5) ?
			"I do not live" + bioContent.home[Math.floor(Math.random() * 10)] + "; " +
			"nor do I own" + bioContent.own[Math.floor(Math.random() * 10)] + ".\n\n" :
			"I do not work" + bioContent.work[Math.floor(Math.random() * 10)] + "; " +
			"and I can't" + bioContent.other[Math.floor(Math.random() * 10)] + ".\n\n") +
			"I might replace this text with a real bio, or maybe leave that for later."
		this.updateState(state => state.set("bio", bio))
	}


	
	async register(event) {

		// Stop form submission
		event.preventDefault();

		// Ensure inputs are valid
		clearTimeout(timer);
		this.validate(true);

		// Check validation
		if (this.getState("valid")) {

			// Get data from form
			const id = this.username.value;
			const pw = this.password.value;
			const name = this.displayName.value;
			var bio = this.bio.value;
			if (bio === "") {
				bio = this.getState("bio")
			}

			// Build image
			let picture;
			let ext;
			if (this.getState("image")) {
				const image = await getCroppedImage(
					this.getState("imageURL"),
					this.getState("imagePixels")
				)
				picture = image.split(",")[1]
				ext = image.split(",")[0].split("/")[1].split(";")[0];
			}

			// Dispatch to registration process
			this.updateState(
				state => state.set("loading", true),
				() => this.props
					.registerUser(id, pw, name, bio, picture, ext)
					.then(callback => {
						console.log("back in register")
						this.props.exit(callback)
					})
					.catch(error => {
						//TODO - More nuanced handling of errors
						//		 occurring when creating user
						this.updateState(state => state
							.set("loading", false)
							//TODO - Surface errors
							.setIn(["errors", "other"], "unknown error")
						)
						console.error(error);
					})
			)

		}

	}



// FORM VALIDATION

	triggerValidation(event) {
		clearTimeout(timer)
		this.updateState(state => state
			.set("errors", Map({
				"username": null,
				"password": null,
				"displayName": null
			}))
		)
		timer = setTimeout(() => this.validate(false), 500)
	}


	triggerValidationAlt(event) {
		if (event.key === "Backspace") {
			this.updateState(state => state
				.set("errors", Map({
					"username": null,
					"password": null,
					"displayName": null
				}))
			)
			this.validate(false)
		}
	}


	validate(forced) {

		// Set up variables
		var filled = 0;
		var fail = false;

		// Validate username
		let errorUsername;
		const username = this.username.value;
		if (username !== "") {
			filled += 1

			// Ensure username is at least the minimum length
			if (username.length < 3) {
				fail = true;
				errorUsername = "username must be at least 3 characters"

			// Ensure username is no greater than the maximum length
			} else if (username.length > 30) {
				fail = true;
				errorUsername = "username cannot be longer than 30 characters"

			// Ensure username contains no whitespace
			} else if (username.split(/\s/).length > 1) {
				fail = true;
				errorUsername = "username cannot contain spaces"

			// Ensure username contains no special characters (except - or _)
			} else if (username.split(/[^A-Z0-9_-]/i).length > 1) {
				fail = true;
				errorUsername = "username contains invalid character"

			// Ensure username is not already taken
			} else {
				this.props.podium
					.isUser(username)
					.then(result => { if (result) {
						this.updateState(state => state
							.set("valid", false)
							.setIn(["errors", "username"], "username unavailable")
						)
					}})
					.catch(error => console.error(error))
			}
		} else if (forced) {
			errorUsername = "username cannot be blank";
		}

		//TODO - Add email here (see GDPR)

		// Validate password
		let errorPassword;
		let password;
		const pw1 = this.password.value;
		const pw2 = this.passwordConfirm.value;
		if (pw1 === "") {
			password = pw2
		} else {
			password = pw1
		}
		if (password !== "") {
			filled += 1

			// Ensure password is at least 6 characters
			if (password.length < 6) {
				fail = true;
				errorPassword = "password must be at least 6 characters"

			// Ensure password is no longer than maximum characters
			} else if (password.length > 60) {
				fail = true;
				errorPassword = "password cannot be longer than 60 characters"

			// Ensure passwords match
			} else if (pw1 !== pw2 && pw1 !== "" && pw2 !== "") {
				fail = true
				errorPassword = "passwords do not match"
			}

		} else if (forced) {
			errorPassword = "password cannot be blank"
		}

		// Validate display name
		let errorDisplayName;
		const displayName = this.displayName.value;
		if (displayName !== "") {
			filled += 1

			// Ensure display name is no longer than maximum characters
			if (displayName.length > 60) {
				fail = true
				errorDisplayName = "display name cannot be longer than 60 characters"
			}

		} else if (forced) {
			errorDisplayName = "display name cannot be blank"
		}


		// Check if form is complete
		var valid = false;
		if (!fail & filled === 3) {
			valid = true
		} 

		// Log errors
		this.updateState(state => state
			.set("valid", valid)
			.setIn(["errors", "username"], errorUsername)
			.setIn(["errors", "password"], errorPassword)
			.setIn(["errors", "displayName"], errorDisplayName)
		)

	}



// PROFILE PICTURE PROCESSING

	preloadImage(event) {
		const file = event.target.files[0];
		reader.readAsDataURL(file);
		reader.onloadend = () =>
			this.updateState(state => state
				.set("imageURL", [reader.result])
				.set("image", file)
			)
	}

	imageClear() {
		this.updateState(state => state
			.set("imageURL", null)
			.set("image", null)
			.setIn(["imageCrop", "x"], 0)
			.setIn(["imageCrop", "y"], 0)
			.set("imageZoom", 1.1)
			.set("imagePixels", null)
		)
	}

	onZoomChange(zoom) {
		if (zoom !== this.getState("imageZoom")) {
			this.updateState(state => state
				.set("imageZoom", zoom))
		}
	}

	onCropChange(crop) {
		if (crop.x !== this.getState("imageCrop", "x") ||
			crop.y !== this.getState("imageCrop", "y")) {
			this.updateState(state => state
				.set("imageCrop", fromJS(crop)))
		}
	}

	onCropComplete(croppedArea, croppedAreaPixels) {
		this.updateState(state => state
			.set("imagePixels", croppedAreaPixels)
		)
	}

	showCropper() {
		this.updateState(state => state
			.set("cropping", true))
	}

	hideCropper() {
		this.updateState(state => state
			.set("cropping", false))
	}



// SHOW/HIDE

	highlight(target) {
		this.updateState(state => state
			.set("highlight", target))
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
		this.updateState(state => state
			.set("show", true)
		)
		if (!this.getState("lock")) {
			this.username.focus()
		}
	}


	hide() {
		this.updateState(state => state
			.set("error", null)
			.set("show", false)
		)
	}


	lock() {
		this.updateState(state => state
			.set("lock", true)
		)
	}


	unlock() {
		this.triggerValidation()
		if (this.username.value === "" &&
				this.password.value === "") {
			this.updateState(state => state
				.set("lock", false))
		}
	}


	resetError() {
		this.updateState(state => state
			.set("error", null))
	}




// RENDER

	render() {

		const open = this.getState("show") || this.getState("lock")
		const loading = this.getState("loading")

		return (
			<div
				className="register-capture"
				onMouseOver={this.show.bind(this)}
				onMouseLeave={this.hide.bind(this)}>

				<div className={open ?
						"card register register-open" :
						"card register register-closed"
					}>

					<form onSubmit={this.register.bind(this)}>

						<div className={open ? 
								"register-form register-form-open" :
								"register-form register-form-closed"
							}>

							<div className="register-box register-box-id">
								<p
									className={this.getState("errors", "username") ?
										"register-at register-at-error" :
										(this.getState("at") && this.username && this.username.value !== "") ?
											"register-at register-at-on" :
											"register-at register-at-off"
									}
									onClick={() => this.username.focus()}>
									{loading ?
										<i className="fas fa-circle-notch register-loader" />
										: "@"
									}
								</p>
								<input
									ref={ref => this.username = ref}
									className={(this.username && this.username.value !== "") ?
										(this.getState("errors", "username") ?
											"register-id register-field register-field-error" :
											"register-id register-field register-field-filled")
										:
										"register-id register-field register-field-empty"
									}
									onKeyPress={this.triggerValidation.bind(this)}
									onKeyUp={this.triggerValidationAlt.bind(this)}
									onFocus={this.showAt.bind(this)}
									onBlur={this.hideAt.bind(this)}
									placeholder="Username"
								/>
								<div className="register-error register-error-username">
									{this.getState("errors", "username")}
								</div>
							</div>

							<div className="register-box register-box-password">
								<input
									ref={ref => this.password = ref}
									type="password"
									className={(this.password && this.password.value !== "") ?
										(this.getState("errors", "password") ?
											"register-password register-field register-field-error" :
											"register-password register-field register-field-filled")
										:
										"register-password register-field register-field-empty"
									}
									onKeyPress={this.triggerValidation.bind(this)}
									onFocus={loading ?
										() => this.password.blur() :
										this.lock.bind(this)
									}
									onBlur={this.unlock.bind(this)}
									placeholder="Password..."
								/>
								<input
									ref={ref => this.passwordConfirm = ref}
									type="password"
									className={(this.passwordConfirm && this.passwordConfirm.value !== "") ?
										(this.getState("errors", "password") ?
											"register-password register-field register-field-error" :
											"register-password register-field register-field-filled")
										:
										"register-password register-field register-field-empty"
									}
									onMouseUp={() => {
										if (this.password.value === "" && this.passwordConfirm.value === "") {
											this.password.focus()
										}
									}}
									onKeyPress={this.triggerValidation.bind(this)}
									onFocus={loading ?
										() => this.passwordConfirm.blur() :
										this.lock.bind(this)
									}
									onBlur={this.unlock.bind(this)}
									placeholder="Confirm Password..."
								/>
								<div className="register-error register-error-password">
									{this.getState("errors", "password")}
								</div>
							</div>

							<div className="register-box register-box-picture">
								{this.getState("imageURL") ?
									<div className="register-image-holder">
										<div
											className="register-cropper"
											onMouseOver={this.showCropper.bind(this)}
											onMouseLeave={this.hideCropper.bind(this)}>
											<Cropper
												image={this.getState("imageURL")}
												crop={this.getState("imageCrop").toJS()}
												zoom={this.getState("imageZoom")}
												aspect={1}
												showGrid={false}
												onZoomChange={this.onZoomChange.bind(this)}
												onCropChange={this.onCropChange.bind(this)}
												onCropComplete={this.onCropComplete.bind(this)}
											/>
											{(this.getState("cropping")) ?
												<div className="register-crop-overlay">
													<div className="register-crop-message">
														scroll to zoom
													</div>
													<div
														className="register-crop-button register-crop-swap"
														onClick={() => this.imageUpload.click()}>
														<span className="fas fa-image register-crop-icon"></span>
													</div>
													<div
														className="register-crop-button register-crop-cancel"
														onClick={this.imageClear.bind(this)}>
														<span className="fas fa-times register-crop-icon"></span>
													</div>
												</div> : null
											}
										</div>
									</div>
									:
									<div className="register-image-holder">
										<img
											className="register-image"
											onClick={() => {
												this.lock()
												this.imageUpload.click()
											}}
											src="./images/profile-placeholder.png"
											alt=""
										/>
									</div>
								}
								<input
									ref={ref => this.imageUpload = ref}
									style={{ display: "none" }}
									type='file'
									accept="image/*"
									onChange={this.preloadImage.bind(this)}
								/>
							</div>

							<div className="register-box register-box-name">
								<input
									ref={ref => this.displayName = ref}
									className={(this.displayName && this.displayName.value !== "") ?
										(this.getState("errors", "displayName") ?
											"register-name register-field register-field-error" :
											"register-name register-field register-field-filled")
										:
										"register-name register-field register-field-empty"
									}
									onKeyPress={this.triggerValidation.bind(this)}
									onFocus={loading ?
										() => this.displayName.blur() :
										this.lock.bind(this)
									}
									onBlur={this.unlock.bind(this)}
									placeholder="Display Name"
								/>
								<div className="register-error register-error-displayname">
									{this.getState("errors", "displayName")}
								</div>
							</div>

							<div className="register-box register-box-bio">
								<textarea
									maxLength={500}
									ref={ref => this.bio = ref}
									className={(this.bio && this.bio.value !== "") ?
										(this.getState("errors", "bio") ?
											"register-bio register-field register-field-error" :
											"register-bio register-field register-field-filled")
										:
										"register-bio register-field register-field-empty"
									}
									onFocus={loading ?
										() => this.bio.blur() :
										this.lock.bind(this)
									}
									onBlur={this.unlock.bind(this)}
									placeholder={this.getState("bio")}
								/>
							</div>

						</div>

						<button
							type="submit"
							style={{ display: "none" }}
						/>

					</form>

					<div
						className={open ?
							"register-icon-holder register-icon-holder-open" :
							"register-icon-holder register-icon-holder-closed"
						}
						onClick={() => this.username.focus()}>
						<i className="fas fa-user-plus register-icon" />
						<span className="register-caption">sign up</span>
					</div>

					{loading ?
						<div className="register-loading-mask"></div>
						: null
					}

				</div>
				
			</div>
		);
	}
}

export default Register;
