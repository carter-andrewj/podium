import React, { Component } from 'react';
import { Map, fromJS } from 'immutable';


import Post from '../../posting/post';




class Profile extends Component {

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
		this.props.getProfile(this.props.user.get("address"))
			.then(profile => {
				this.updateState(state => state
					.set("profile", profile)
				);
			});
	}


	render() {
		return (
			<div className="Profile container">
				<div className="profile-header card">
					<div className="profile-picture-holder">
						<img
							className="profile-picture profile-editable"
							src={this.state.data.getIn(["profile", "picture"])}
							alt=""
						/>
					</div>
					<div className="profile-name-holder">
						<p className="profile-name">
							{this.state.data.getIn(["profile", "name"])}
						</p>
						<p className="profile-id">
							@{this.state.data.getIn(["profile", "id"])}
						</p>
					</div>
					<div className="profile-address-holder">
						<p className="profile-address">
							<strong>ADDRESS:</strong> {this.props.user.get("address")}
						</p>
					</div>
					<div className="profile-bio-holder profile-editable">
						<p className="profile-bio">
							{this.state.data.getIn(["profile", "bio"])}
						</p>
					</div>
				</div>
				<div className="row">
					<div className="col-1"></div>
					<div className="col-10 input-col">
						{this.props.posts
							.filter(p => this.props.user.get("address") ===
								p.get("author"))
							.sort((a, b) => a.created < b.created ? 1 : -1)
							.map(post => <Post

								key={"post-" + post.get("address")}
								index={post.get("depth")}

								thread={post.origin}
								user={this.props.user.get("address")}
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
					<div className="col-1"></div>
				</div>
			</div>
		);
	}
}

export default Profile;
