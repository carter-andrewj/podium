import React, { Component } from 'react';

import { timeform } from 'demo/utils';


class UserCard extends Component {

	//TODO - Add balances

	//TODO - Add join date

	//TODO - Hook up integrity and affinity gauges to real values

	render() {
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
				</p>
			</div>
			<div className="usercard-details-holder">
				<p className="usercard-id">
					@{this.props.user.get("id")}
				</p>
			</div>
			<div className="usercard-bio-holder">
				<p className="usercard-bio">
					{this.props.user.get("bio")}
				</p>
			</div>
			<div className="usercard-details-holder">
				<p className="usercard-date">
					Joined: {timeform(this.props.user.get("created"))}
				</p>
			</div>
			<div className="usercard-buttons">
				<button
					className="usercard-button usercard-profile-button"
					onClick={this.props.setCoreMode.bind(this,
						"profile", this.props.user)}>
					<span className="fas fa-user-circle usercard-button-icon"></span>
				</button>
				{(this.props.user.getIn(["following", this.props.user.get("address")])) ?
					<button
						className="usercard-button usercard-unfollow-button"
						onClick={this.props.unfollowUser.bind(this, this.props.user)}>
						<span className="fas fa-eye usercard-button-icon"></span>
					</button> :
					<button
						className="usercard-button usercard-follow-button"
						onClick={this.props.followUser.bind(this, this.props.user)}>
						<span className="fas fa-eye usercard-button-icon"></span>
					</button>
				}
				<button
					className="usercard-button usercard-report-button"
					onClick={this.props.followUser.bind(this,
						this.props.user)}>
					<span className="fas fa-exclamation-triangle usercard-button-icon"></span>
				</button>
				<button
					className="usercard-button usercard-message-button"
					onClick={this.props.followUser.bind(this,
						this.props.user)}>
					<span className="fas fa-envelope usercard-button-icon"></span>
				</button>
			</div>
		</div>
	}
}

export default UserCard;
