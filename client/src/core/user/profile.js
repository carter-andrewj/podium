import React, { Component } from 'react';

import { Map, fromJS } from 'immutable';




class Profile extends Component {

	constructor() {
		super()
		this.state = {
			data: Map(fromJS({
				loadFollow: false,
			}))
		}
	}


	updateState(up, callback) {
		this.setState(
			({data}) => { return { data: up(data) } },
			callback
		);
	}


	followUser() {
		this.updateState(state => state
			.set("loadFollow", true),
			() => this.props
				.followUser(this.props.profile.get("address"))
				.then(() => this.updateState(state => state
					.set("loadFollow", false)
				))
		)
	}


	unfollowUser() {
		this.updateState(state => state
			.set("loadFollow", true),
			() => this.props
				.unfollowUser(this.props.profile.get("address"))
				.then(() => this.updateState(state => state
					.set("loadFollow", false)
				))
		)
	}


	render() {
		return (
			<div
				className="searchcard"
				onClick={() => this.props.goToProfile(
					this.props.profile.get("address")
				)}>
				{(this.props.profile.get("following")) ?

					// Show unfollow button/loader
					(this.state.data.get("loadFollow")) ?
						<div
							className="searchcard-button searchcard-follow-button
								searchcard-button-off searchcard-button-load">
							<span className="fas fa-dots searchcard-icon">
							</span>
						</div>
						:
						<div
							className="searchcard-button searchcard-follow-button
								searchcard-button-on"
							onClick={this.unfollowUser.bind(this)}>
							<span className="fas fa-eye-slash searchcard-icon">
							</span>
						</div>

					:

					// Show follow button/loader
					(this.state.data.get("loadFollow")) ?
						<div
							className="searchcard-button searchcard-follow-button
								searchcard-button-on searchcard-button-load">
							<span className="fas fa-dots searchcard-icon">
							</span>
						</div>
						:
						<div
							className="searchcard-button searchcard-follow-button
								searchcard-button-off"
							onClick={this.followUser.bind(this)}>
							<span className="fas fa-eye searchcard-icon">
							</span>
						</div>

				}
				<div
					className="searchcard-button searchcard-post-button"
					onClick={this.props.addToPost.bind(this,
						this.props.profile.get("address"))}>
					<span className="fas fa-user searchcard-icon">
					</span>
				</div>
				<img
					className="searchcard-image"
					src={this.props.profile.get("pictureURL")}
					alt=""
				/>
				<p className="searchcard-name">
					{this.props.profile.get("name")}
				</p>
				<p className="searchcard-id">
					@{this.props.id}
				</p>
			</div>
		);
	}

}

export default Profile;
