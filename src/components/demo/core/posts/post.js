import React, { Component } from 'react';
import '../../../../App.css';

import PostCore from './postcore';
import FollowingPost from './following';
import ReplyPost from './reply';
import ReportPost from './report';
import ReactPost from './react';
import RetractedPost from './retracted';
import OwnedPost from './owned';




class Post extends Component {

	constructor() {
		super()
		this.state = {
			loading: false,
		}
	}


	componentDidMount() {
		if (!("content" in this.props.post)) {
			const state = this.state;
			state.loading = true;
			this.setState(state);
			this.props.getPost(this.props.post.address)
				.then(() => {
					const state = this.state;
					state.loading = false;
					this.setState(state);
				});
		}
	}


	render() {

		let content;
		if (this.state.loading) {

			content = <div>loading {this.props.post.address}</div>

		} else {

			// Build post content
			const postContent = <PostCore
				user={this.props.user}
				post={this.props.post}
			/>

			// Wrap post content
			switch (this.props.post.type) {

				// Posts from users the active
				// user is following
				case ("following"):
					content = <FollowingPost
						user={this.props.user}
						post={this.props.post}>
						{postContent}
					</FollowingPost>
					break;

				// Replies
				case ("reply"):
					content = <ReplyPost
						user={this.props.user}
						post={this.props.post}>
						{postContent}
					</ReplyPost>
					break;

				// Reports
				case ("report"):
					content = <ReportPost
						user={this.props.user}
						post={this.props.post}>
						{postContent}
					</ReportPost>
					break;

				// Posts for reaction
				case ("react"):
					content = <ReactPost
						user={this.props.user}
						post={this.props.post}>
						{postContent}
					</ReactPost>
					break;

				// Retracted posts
				case ("retraction"):
					content = <RetractedPost
						user={this.props.user}
						post={this.props.post}>
						{postContent}
					</RetractedPost>
					break;

				// Posts by the active user
				case ("owned"):
					content = <OwnedPost
						user={this.props.user}
						post={this.props.post}>
						{postContent}
					</OwnedPost>
					break;

				default:
					content = <div></div>

			}

		}

		// Build feed
		return (
			<div className="post">
				{content}
			</div>
		);

	}
}

export default Post;
