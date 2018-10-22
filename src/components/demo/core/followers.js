import React, { Component } from 'react';
import '../../../App.css';

import UserCard from './usercard';



class Followers extends Component {

	render() {

		// Check data
		let content;
		if (this.props.followerCount === 0) {

			// Handle empty data (i.e. no followers)
			content = <div className="empty-page">
				<p className="empty-text">
					...no followers yet...
				</p>
			</div>

		} else {

			// Build content
			// TODO - Sort followers by follow-date
			content = <div>
				<div className="follower-header">
					<p className="title">
						You have {this.props.followerCount} followers:
					</p>
				</div>
				{Object.keys(this.props.followers).map(k =>
					<UserCard

						key={k}
						user={this.props.users[k]}

						getProfile={this.props.getProfile}
						followUser={this.props.followUser}
						unfollowUser={this.props.unfollowUser}

						setCoreMode={this.props.setCoreMode}

					/>
				)}
			</div>

		}

		// Return component
		return (
			<div ref="followers">
				{content}
				<div className="footer-spacer">
				</div>
			</div>
		);

	}
}

export default Followers;
