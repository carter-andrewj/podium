import React, { Component } from 'react';




class ProfileCard extends Component {


	componentDidMount() {
		if (!("id" in this.props.user)) {
			this.props.getProfile(this.props.user.get("address"));
		}
	}


	render() {

		// Check if user is loaded
		return <div className="usercard card">
			<div className="usercard-top">
				<img
					className="usercard-picture"
					src={this.props.user.get("picture")}
					alt=""
				/>
				<div className="usercard-gauges">
					<div className="usercard-gauge affinity-gauge">
						<div
							className="affinity-gauge-box"
							height={(100.0 * this.props.user.get("affinity")) + "%"}>
						</div>
						<p className="affinity-gauge-label">
							<span className="fas fa-sync-alt"></span>
						</p>
					</div>
					<div className="usercard-gauge integrity-gauge">
						<div
							className="integrity-gauge-box"
							height={(100.0 * this.props.user.get("integrity")) + "%"}>
						</div>
						<p className="integrity-gauge-label">
							<span className="fas fa-sync-alt"></span>
						</p>
					</div>
				</div>
			</div>
			<div className="usercard-name-holder">
				<p className="usercard-name">
					{this.props.user.get("name")}
					<span className="usercard-id">
						@{this.props.user.get("id")}
					</span>
				</p>
			</div>
			<div className="usercard-bio-holder">
				<p className="usercard-bio">
					{this.props.user.get("bio")}
				</p>
			</div>
			<div className="usercard-buttons">
				<button
					className="usercard-button profile-button"
					onClick={this.props.setCoreMode.bind(this,
						"profile", this.props.user)}>
					<span className="fas fa-user"></span>
				</button>
				<button
					className="usercard-button follow-button"
					onClick={
						(this.props.user.get("following")) ?
							this.props.unfollowUser.bind(this, this.props.user) :
							this.props.followUser.bind(this, this.props.user)
					}>
					<span className="fas fa-eye"></span>
				</button>
				<button
					className="usercard-button follow-button"
					onClick={this.props.followUser.bind(this,
						this.props.user)}>
					<span className="fas fa-eye"></span>
				</button>
			</div>
		</div>

	}

}

export default ProfileCard;
