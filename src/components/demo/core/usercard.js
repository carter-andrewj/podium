import React, { Component } from 'react';
import '../../../App.css';




class UserCard extends Component {


	componentDidMount() {
		if (!("id" in this.props.user)) {
			this.props.getProfile(this.props.user.address);
		}
	}


	render() {

		// Check if user is loaded
		let content;
		console.log("USERCARD", this.props.user);
		if ("id" in this.props.user) {

			// Show profile
			content = <div className="usercard card">
				<img
					className="usercard-picture"
					src={this.props.user.picture}
					alt=""
				/>
				<div className="usercard-bio-holder">
					<p className="usercard-bio">
						{this.props.user.bio}
					</p>
				</div>
				<div className="usercard-name-holder">
					<p className="usercard-name">
						{this.props.user.name}
						<span className="usercard-id">
							@{this.props.user.id}
						</span>
					</p>
				</div>
				<div className="usercard-buttons">
					<button
						className="def-button usercard-button profile-button"
						onClick={this.props.setCoreMode.bind(this,
							"profile", this.props.user)}>
						profile
					</button>
					<button
						className="def-button usercard-button follow-button"
						onClick={this.props.followUser.bind(this,
							this.props.user)}>
						follow
					</button>
				</div>
			</div>


		} else {

			// Show loading placeholder
			content = <div className="usercard card">
				Loading...
			</div>

		}

		//TODO - Switch follow button to unfollow if user already followed
		return (content);

	}
}

export default UserCard;
