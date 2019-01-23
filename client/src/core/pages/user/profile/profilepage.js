import React, { Component } from 'react';
import { Map, fromJS } from 'immutable';

import { timeform } from 'utils';


import Post from '../../posting/post';





class ProfilePage extends Component {

	constructor() {
		super()
		this.state = {
			data: Map(fromJS({
				profile: {
					name: "",
					id: "",
					picture: "./images/profile-placeholder.png",
					bio: ""
				}
			}))
		}
	}

	updateState(up, callback) {
		this.setState(
			({data}) => { return {data: up(data)} },
			callback
		);
	}

	componentWillMount() {

		console.log(this.props)

		this.props.getProfile(this.props.userAddress)
			.then(profile => {
				this.updateState(state => state
					.set("profile", profile)
				);
			});
	}


	render() {
		return (
			<div className="Profile">
				<div className="profile-header card">
					<div className="profile-picture-holder">
						<img
							className="profile-picture"
							src={this.state.data.getIn(["profile", "pictureURL"])}
							alt=""
						/>
					</div>
					<div className="profile-name-holder">
						<p className="profile-name">
							{this.state.data.getIn(["profile", "name"])}
						</p>
					</div>
					<div className="profile-id-holder">
						{this.state.data.getIn(["profile", "id"]) ?
							<p className="profile-id">
								@{this.state.data.getIn(["profile", "id"])} |
								Joined: {timeform(this.state.data.getIn(["profile", "created"]))}
							</p>
							: null
						}
					</div>
					<div className="profile-bio-holder">
						<p className="profile-bio">
							{this.state.data.getIn(["profile", "bio"])}
						</p>
					</div>
					<div className="profile-button-holder">
						<div className="profile-button">
							<span className="fas fa-eye profile-icon"></span>
						</div>
						<div className="profile-button">
							<span className="fas fa-reply profile-icon"></span>
						</div>
						<div className="profile-button">
							<span className="fas fa-envelope profile-icon"></span>
						</div>
						<div className="profile-button profile-button-right">
							<span className="fas fa-exclamation-triangle profile-icon"></span>
						</div>
					</div>
				</div>
				<div className="profile-feed">
					<div className="profile-filter card">
						<div className="profile-filter-title">
							<span className="fas fa-filter filter-title-icon"></span>
						</div>
						<div className="profile-filter-button">
							<span className="fas fa-comment filter-icon"></span>
						</div>
						<div className="profile-filter-button">
							<span className="fas fa-comments filter-icon"></span>
						</div>
						<div className="profile-filter-button">
							<span className="fas fa-image filter-icon"></span>
						</div>
						<div className="profile-filter-button">
							<span className="fas fa-bullhorn filter-icon"></span>
						</div>
						<div className="profile-filter-button">
							<span className="fas fa-hashtag filter-icon"></span>
						</div>
						<div className="profile-filter-button">
							<span className="fas fa-exclamation-triangle filter-icon"></span>
						</div>
						<div className="profile-filter-button">
							<span className="fas fa-ban filter-icon"></span>
						</div>
						<div className="profile-filter-button">
							<span className="fas fa-arrows-alt-v filter-icon"></span>
						</div>
						<div className="profile-filter-button">
							<span className="fas fa-coins filter-icon"></span>
						</div>
						<div className="profile-filter-label">
							<p className="profile-filter-text">label here
							</p>
						</div>
					</div>
					{this.props.posts
						.filter(p => this.props.userAddress === p.get("author"))
						.sort((a, b) => a.created < b.created ? 1 : -1)
						.map(post => <Post

							key={"post-" + post.get("address")}
							index={post.get("depth")}

							thread={post.origin}
							user={this.props.userAddress}
							post={post}

							getProfileFromID={this.props.getProfileFromID}
							getTopicFromID={this.props.getTopicFromID}

							sendPost={this.props.sendPost}

							promotePost={this.props.promotePost}
							reportPost={this.props.reportPost}
							retractPost={this.props.retractPost}
							amendPost={this.props.amendPost}

						/>)
						.toList()
					}
					<div className="footer-spacer"></div>
				</div>
			</div>
		);
	}
}

export default ProfilePage;
