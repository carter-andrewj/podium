import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { Map, fromJS } from 'immutable';




class SearchCard extends Component {

	constructor() {
		super()
		this.state = {
			data: Map(fromJS({
				focus: false,
				loadFollow: false
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


	focus() {
		this.updateState(state => state
			.set("focus", true)
		)
	}


	unfocus() {
		this.updateState(state => state
			.set("focus", false)
		)
	}


	render() {

		return (
			<div
				className="searchcard"
				onMouseOver={this.focus.bind(this)}
				onMouseLeave={this.unfocus.bind(this)}
				onClick={() => this.profileLink.click()}>
				<Link
					to={`/user/${this.props.profile.get("address")}`}
					innerRef={ref => this.profileLink = ref}
					style={{ display: "none" }}
				/>
				{(this.props.profile.get("following")) ?

					// Show unfollow button/loader
					(this.state.data.get("loadFollow")) ?
						<div
							className="searchcard-button searchcard-button-follow
								searchcard-button-off searchcard-button-load">
							<span className="fas fa-dots searchcard-icon">
							</span>
						</div>
						:
						<div
							className="searchcard-button searchcard-button-follow
								searchcard-button-on"
							onClick={this.unfollowUser.bind(this)}>
							<span className="fas fa-eye-slash searchcard-icon">
							</span>
						</div>

					:

					// Show follow button/loader
					(this.state.data.get("loadFollow")) ?
						<div
							className="searchcard-button searchcard-button-follow
								searchcard-button-on searchcard-button-load">
							<span className="fas fa-dots searchcard-icon">
							</span>
						</div>
						:
						<div
							className="searchcard-button searchcard-button-follow
								searchcard-button-off"
							onClick={this.followUser.bind(this)}>
							<span className="fas fa-eye searchcard-icon">
							</span>
						</div>

				}
				<div
					className="searchcard-button searchcard-button-post"
					onClick={this.props.addToPost.bind(this,
						this.props.profile.get("address"))}>
					<span className="fas fa-reply searchcard-icon">
					</span>
				</div>
				<img
					className="searchcard-image"
					src={this.props.profile.get("pictureURL")}
					alt=""
				/>
				<div className="searchcard-name">
					<p className="searchcard-name-text">
						{this.props.profile.get("name")}
					</p>
				</div>
				<div className="searchcard-id">
					<p className="searchcard-id-text">
						@{this.props.profile.get("id")}
					</p>
				</div>
			</div>
		);
	}

}

export default SearchCard;
