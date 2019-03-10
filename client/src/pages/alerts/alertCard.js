import React from 'react';
import { Link } from 'react-router-dom';
import ImmutableComponent from '../../components/immutableComponent';

import { Map } from 'immutable';

import { timeform } from 'utils';

import Expander from '../../components/animators/expander';
import MiniLoader from '../../components/miniLoader';




class AlertCard extends ImmutableComponent {

	constructor() {
		super({
			icon: "",
			text: "",
			link: "/",
			profile: Map()
		})
	}


	immutableComponentWillMount() {

		// Unpack alert
		const userAddress = this.props.alert.get("from")
		const postAddress = this.props.alert.get("about")

		// Determine alert type
		let icon;
		switch (this.props.alert.get("type")) {
			case ("mention"):
				icon = "at"
				break;
			case ("follow"):
				icon = "eye"
				break;
			case ("reply"):
				icon = "reply"
				break
			default:
				icon = ""
		}
		this.updateState(state => state.set("icon", icon))

		// Fetch subject user
		this.props
			.getUser(userAddress, false)
			.then(user => user.profile())
			.then(profile => {

				// Build alert content
				let text;
				let link;
				switch (this.props.alert.get("type")) {

					case ("mention"):
						link = `/post/${postAddress}`
						text = <span className="alert-text">
							<Link to={`/user/${profile.get("id")}`}>
								<span className="alert-mention">
									@<span className="alert-mention-id">
										{profile.get("id")}
									</span>
								</span>
							</Link>
							{" mentioned you"}
						</span>
						
						break;

					case ("follow"):
						link = `/user/${profile.get("id")}`
						text = <span className="alert-text">
							<Link to={link}>
								<span className="alert-mention">
									@<span className="alert-mention-id">
										{profile.get("id")}
									</span>
								</span>
							</Link>
							{" followed you"}
						</span>
						break;

					case ("reply"):
						text = <span className="alert-text">
							<Link to={`/user/${profile.get("id")}`}>
								<span className="alert-mention">
									@<span className="alert-mention-id">
										{profile.get("id")}
									</span>
								</span>
							</Link>
							{" replied to your post"}
						</span>
						link = `/post/${postAddress}`
						break;

					//TODO - Promotions, etc...

					default:
						text = `Unknown Alert Type: ${this.props.alert.get("type")}`
						link = "/"

				}

				// Store in state
				this.updateState(
					state => state
						.set("profile", profile)
						.set("text", text)
						.set("link", link),
				)

			})
			.catch(console.error)

	}


	render() {
		const profile = this.getState("profile")
		const seen = this.props.alert.get("seen")
		return <Expander time={1.0}>
			<div
				className={seen ?
					"alertcard card hover-card alertcard-old" :
					"alertcard card hover-card alertcard-new"
				}
				onClick={() => this.props.transition(
					() => this.alertLink ? this.alertLink.click() : null
				)}>

				{profile ?
					<Link
						to={this.getState("link")}
						innerRef={ref => this.alertLink = ref}
						style={{ display: "none" }}
					/>
					: null
				}

				<div className={seen ?
						"alertcard-title-holder alertcard-title-old" :
						"alertcard-title-holder alertcard-title-new"
					}>
					<i className={`fas fa-${this.getState("icon")} alertcard-title-icon`} />
				</div>

				<div className="alertcard-picture-holder">
					{profile && false ?
						<img
							className="alertcard-picture"
							src={this.getState("profile", "pictureURL")}
							alt=""
						/>
						:
						<div className="alertcard-loader-holder">
							<MiniLoader size={1.2} color="white" />
						</div>
					}
				</div>

				<div className="alertcard-message-holder">
					<p className={seen ?
							"alertcard-message alertcard-message-old" :
							"alertcard-message alertcard-message-new"
						}>
						{this.getState("text")}
					</p>
				</div>

				<div className="alertcard-time-holder">
					<p className="alertcard-time">
						{timeform(this.props.alert.get("created"))}
					</p>
				</div>

			</div>
		</Expander>

	}

}

export default AlertCard;
