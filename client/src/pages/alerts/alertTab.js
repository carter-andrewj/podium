import React from 'react';
import { Link } from 'react-router-dom';
import ImmutableComponent from '../../components/immutableComponent';

import { Map, List } from 'immutable';

import { timeform } from 'utils';

import Slider from '../../components/animators/slider';



class AlertTab extends ImmutableComponent {

	constructor() {
		super({
			text: "",
			link: "/",
			profile: Map()
		})
	}


	immutableComponentWillMount() {

		// Unpack alert
		const userAddress = this.props.alert.get("from")
		const postAddress = this.props.alert.get("about")

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
						text = `@${profile.get("id")} mentioned you`
						link = `/post/${postAddress}`
						break;

					case ("follow"):
						text = `@${profile.get("id")} followed you`
						link = `/user/${profile.get("id")}`
						break;

					case ("reply"):
						text = `@${profile.get("id")} replied to you`
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
					() => this.props.ready(this.props.alert.get("key"))
				)

			})
			.catch(console.error)

	}


	followAlert() {
		const clear = List([this.props.alert.get("key")])
		this.props.clearAlerts(clear).catch(console.error)
		this.props.transition(() => this.alertLink.click())
	}


	render() {
		return (this.getState("profile") ?
			<Slider
				position="relative"
				offset={{ x: -18, y: 0 }}
				time={0.4}
				show={this.props.show}>
				<div
					className="alerttab card hover-card"
					onClick={this.followAlert.bind(this)}>

					<Link
						to={this.getState("link")}
						innerRef={ref => this.alertLink = ref}
						style={{ display: "none" }}
					/>

					<div className="alerttab-picture-holder">
						<img
							className="alerttab-picture"
							src={this.getState("profile", "pictureURL")}
							alt=""
						/>
					</div>

					<div className="alerttab-content-holder">
						<p className="alerttab-time">
							{timeform(this.props.alert.get("created"))}
						</p>
						<p className="alerttab-text">
							{this.getState("text")}
						</p>
					</div>

				</div>
			</Slider>
			: null
		)
	}

}

export default AlertTab;
