import React, { Component } from 'react';
import '../../../App.css';

import Post from './posts/post';




class Profile extends Component {

	constructor() {
		super()
		this.state = {
			profile: {
				name: "",
				id: "",
				picture: "./images/profile-placeholder.png",
				bio: ""
			}
		}
	}

	componentWillMount() {
		this.props.getProfile(this.props.user.address)
			.then(profile => {
				const state = this.state;
				state.profile = profile;
				this.setState(state);
			});
	}


	render() {
		console.log(this.props)
		return (
			<div className="Profile container">
				<div className="profile-header card">
					<div className="profile-picture-holder">
						<img
							className="profile-picture profile-editable"
							src={this.state.profile.picture}
							alt=""
						/>
					</div>
					<div className="profile-name-holder">
						<p className="profile-name">
							{this.state.profile.name}
						</p>
						<p className="profile-id">
							@{this.state.profile.id}
						</p>
					</div>
					<div className="profile-address-holder">
						<p className="profile-address">
							<strong>ADDRESS:</strong> {this.props.user.address}
						</p>
					</div>
					<div className="profile-bio-holder profile-editable">
						<p className="profile-bio">
							{this.state.profile.bio}
						</p>
					</div>
				</div>
				<div className="row">
					<div className="col-1"></div>
					<div className="col-10 input-col">
						{Object.keys(this.props.posts)
							.filter(p => this.props.user.address ===
								this.props.posts[p].author)
							.sort((a, b) => {
								const x = this.props.posts[a];
								const y = this.props.posts[b];
								return (x.created < y.created) ? 1 : -1;
							})
							.map(k => {
								const post = this.props.posts[k];
								const user = this.state.profile;
								return <Post
									key={k}
									user={user}
									post={post}
									getPost={this.props.getPost}
									omitType={true}
								/>
							})
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
