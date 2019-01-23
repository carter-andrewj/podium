import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { Map, fromJS } from 'immutable';

import Cropper from 'react-easy-crop';


import Slider from '../core/widgets/slider';
import Fader from '../core/widgets/fader';



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
		" posessions, they own me",
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
		", it's more like paid procrastination",
		" as a PA for Elvis",
		" below a temperature of 5 Kelvin"
	],
	other: [
		" play the tuba while cartwheeling",
		" divide by zero",
		" move objects with my mind",
		" deplantricate, because I don't know what that is",
		" become King of Canada, apparently",
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

	// As a blob
	// return new Promise((resolve, reject) => {
	// 	canvas.toBlob(file => {
	// 		resolve(URL.createObjectURL(file))
	// 	}, 'image/jpeg')
	// })
}




let timer;

const reader = new FileReader();


class Register extends Component {

	constructor(props) {
		super();
		this.state = {
			data: Map(fromJS({

				imageURL: null,
				image: null,
				imageCrop: { x: 0, y: 0 },
				imageZoom: 1.1,
				imagePixels: null,
				cropping: false,

				at: false,
				target: null,

				valid: false,
				errors: {
					username: null,
					password: null,
					displayName: null
				},

				exit: false

			}))
		}
		this.register = this.register.bind(this);
		this.showAt = this.showAt.bind(this);
		this.hideAt = this.hideAt.bind(this);
	}


	updateState(up, callback) {
		this.setState(
			({data}) => { return { data: up(data) } },
			callback
		);
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
		if (this.state.data.get("valid")) {

			// Get data from form
			const id = this.username.value;
			const pw = this.password.value;
			const name = this.displayName.value;
			var bio = this.bio.value;
			if (bio === "") {
				bio = this.state.data.get("bio")
			}

			// Build image
			let picture;
			let ext;
			if (this.state.data.get("image")) {
				const image = await getCroppedImage(
					this.state.data.get("imageURL"),
					this.state.data.get("imagePixels")
				)
				picture = image.split(",")[1]
				ext = image.split(",")[0].split("/")[1].split(";")[0];
			}

			// Dispatch to registration process
			this.updateState(
				state => state.set("loading", true),
				() => this.props
					.registerUser(id, pw, name, bio, picture, ext)
					//TODO - Handle edge-case where registration
					//		 succeeds, but signin-fails
					.then(result => this.exit(result))
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


	triggerValidation() {
		clearTimeout(timer);
		this.updateState(state => state
			.set("errors", Map({
				"username": null,
				"password": null,
				"displayName": null
			}))
		)
		timer = setTimeout(() => this.validate(false), 500)
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
			if (username.length < 3) {
				fail = true;
				errorUsername = "username must be at least 3 characters"
			} else {
				//TODO - Check if username is already taken
				//TODO - Ensure username contains no whitespace
				//TODO - Ensure username contains only a limited set
				//		 of special characters
			}
			//TODO - Rest of username validation
		} else if (forced) {
			errorUsername = "username cannot be blank";
		}

		//TODO - Add email here (see GDPR)

		// Validate password
		let errorPassword;
		let password;
		const pw1 = this.password.value;
		const pw2 = this.passConfirm.value;
		if (pw1 === "") {
			password = pw2
		} else {
			password = pw1
		}
		if (password !== "") {
			filled += 1
			if (password.length < 6) {
				fail = true;
				errorPassword = "password must be at least 6 characters"
			} else if (pw1 !== pw2 && pw1 !== "" && pw2 !== "") {
				fail = true
				errorPassword = "passwords do not match"
			}
			//TODO - Rest of password validation
		} else if (forced) {
			errorPassword = "password cannot be blank"
		}

		// Validate display name
		let errorDisplayName;
		const displayName = this.displayName.value;
		if (displayName !== "") {
			filled += 1
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


	showAt() {
		this.updateState(state => state.set("at", true))
	}

	hideAt() {
		if (this.username.value === "") {
			this.updateState(state => state.set("at", false))
		}
	}


	exit(callback) {
		this.updateState(
			state => state.set("exit", true),
			() => setTimeout(callback, 800)
		);
	}



	onZoomChange(zoom) {
		if (zoom !== this.state.data.get("imageZoom")) {
			this.updateState(state => state
				.set("imageZoom", zoom))
		}
	}

	onCropChange(crop) {
		if (crop.x !== this.state.data.getIn(["imageCrop", "x"]) ||
			crop.y !== this.state.data.getIn(["imageCrop", "y"])) {
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


	highlight(target) {
		this.updateState(state => state
			.set("highlight", target))
	}


	render() {

		const exit = this.state.data.get("exit")

		return (
			<div ref="register" className="lobby-box">
				<Slider
					direction="top"
					timeIn={0.4} delayIn={0.0}
					timeOut={0.4} delayOut={0.4}
					exit={exit}>
					<div className="register-box card">
						<Fader
							timeIn={0.2} delayIn={0.4}
							timeOut={0.2} delayOut={0.0}
							exit={(this.state.data.get("loading")) || exit}>
							<div
								className="card register-back"
								onMouseOver={this.highlight.bind(this, "back")}
								onMouseOut={this.highlight.bind(this, null)}
								onClick={this.exit.bind(this, () => this.lobbyRoute.click())}>
								{(this.state.data.get("highlight") === "back") ?
									<div className="register-caption register-caption-back">
										cancel
									</div> : null
								}
								<span className="fas fa-chevron-left back-icon"></span>
								<Link
									to="/"
									innerRef={ref => this.lobbyRoute = ref}
									style={{ display: "none "}}
								/>
							</div>
						</Fader>
						<form onSubmit={this.register.bind(this)}>
							<div className="register-top">
								<div className="register-image-box">
									{(this.state.data.get("imageURL")) ?
										<div
											className="register-cropper"
											onMouseOver={this.showCropper.bind(this)}
											onMouseLeave={this.hideCropper.bind(this)}>
											<Cropper
												image={this.state.data.get("imageURL")}
												crop={this.state.data.get("imageCrop").toJS()}
												zoom={this.state.data.get("imageZoom")}
												aspect={1}
												showGrid={false}
												onZoomChange={this.onZoomChange.bind(this)}
												onCropChange={this.onCropChange.bind(this)}
												onCropComplete={this.onCropComplete.bind(this)}
											/>
											{(this.state.data.get("cropping")) ?
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
										</div> :
										<img
											className="register-image"
											onClick={() => this.imageUpload.click()}
											src="./images/profile-placeholder.png"
											alt=""
										/>
									}
									<input
										ref={(ref) => this.imageUpload = ref}
										style={{display: "none"}}
										type='file'
										accept="image/*"
										onChange={this.preloadImage.bind(this)}
									/>
								</div>
								<div className="register-username-box">
									<div style={{position: "relative"}}>
										<p
											className={(this.state.data.get("at")) ?
												"register-at register-at-on" :
												"register-at register-at-off"}
											onClick={() => this.username.focus()}>
											@
										</p>
										<input
											ref={(ref) => this.username = ref}
											className="register-field register-id"
											onKeyPress={this.triggerValidation.bind(this)}
											onFocus={this.showAt.bind(this)}
											onBlur={this.hideAt.bind(this)}
											placeholder="Username"
										/>
										<div className="register-error register-error-username">
											{this.state.data.getIn(["errors", "username"])}
										</div>
									</div>
									<input
										ref={(ref) => this.password = ref}
										className="register-field register-password"
										onKeyPress={this.triggerValidation.bind(this)}
										placeholder="Password..."
									/>
									<input
										ref={(ref) => this.passConfirm = ref}
										className="register-field register-password"
										onKeyPress={this.triggerValidation.bind(this)}
										placeholder="Confirm Password..."
									/>
									<div className="register-error register-error-password">
										{this.state.data.getIn(["errors", "password"])}
									</div>
								</div>
							</div>
							<div className="register-bottom-box">
								<input
									ref={(ref) => this.displayName = ref}
									className="register-field register-name"
									onKeyPress={this.triggerValidation.bind(this)}
									placeholder="Display Name"
								/>
								<div className="register-error register-error-displayname">
									{this.state.data.getIn(["errors", "displayName"])}
								</div>
								<textarea
									ref={(ref) => this.bio = ref}
									className="register-field register-bio"
									placeholder={this.state.data.get("bio")}
								/>
							</div>
							<Fader
								timeIn={0.2} delayIn={0.4}
								timeOut={0.2} delayOut={0.0}
								exit={exit}>
								{(!this.state.data.get("valid")) ?
									<div
										className="card register-button register-invalid"
										onMouseOver={this.highlight.bind(this, "register")}
										onMouseOut={this.highlight.bind(this, null)}
										onClick={this.register.bind(this)}>
										{(this.state.data.get("highlight") === "register") ?
											<div className="register-caption register-caption-invalid">
												form incomplete
											</div> : null
										}
										<span className="fas fa-user-slash register-icon"></span>
									</div> :
									(this.state.data.get("loading")) ?
										<div className="card register-button register-loading">
											<img
												className="register-loading-glyph"
												src="./images/icon-glyph-green.png"
												alt=""
											/>
											<div className="register-caption register-caption-valid">
												creating @{this.username.value}
											</div>
										</div> :
										<div
											className="card register-button register-valid"
											onMouseOver={this.highlight.bind(this, "register")}
											onMouseOut={this.highlight.bind(this, null)}
											onClick={this.register.bind(this)}>
											{(this.state.data.get("highlight") === "register") ?
											<div className="register-caption register-caption-valid">
												create account
											</div> : null
										}
											<span className="fas fa-user-plus register-icon"></span>
										</div>
								}
							</Fader>
							{(this.state.data.get("loading")) ?
								<div className="register-loading-mask"></div>
								: null
							}
							<button
								type="submit"
								style={{display: "none"}}
							/>
						</form>
					</div>
				</Slider>
			</div>
		);

	}

}

export default Register;