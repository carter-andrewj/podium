import React, { Component } from 'react';

import PostContent from './postcontent';

import FollowingPost from './wrappers/following';
import ReplyPost from './wrappers/reply';
import ReportPost from './wrappers/report';
import ReactPost from './wrappers/react';
import RetractedPost from './wrappers/retracted';
import OwnedPost from './wrappers/owned';

import Report from '../reporting/report';




class Thread extends Component {

	constructor() {
		super()
		this.state = {
			reporting: false
		}
		this.createReport = this.createReport.bind(this);
		this.cancelReport = this.cancelReport.bind(this);
	}


	componentDidMount() {
		console.log(this.props.post);
		if (!("content" in this.props.post)) {
			this.props.getPost(this.props.post.address)
				.then(() => {
					this.props.readyPost(this.props.post.address);
				});
		} else {
			this.props.readyPost(this.props.post.address);
		}
	}


	createReport() {
		var state = this.state;
		state.reporting = true;
		this.setState(state);
	}


	cancelReport() {
		var state = this.state;
		state.reporting = false;
		this.setState(state);
	}


	render() {

		let reporting;
		let content;
		if (!(this.props.ready)) {

			content = null;

		} else {

			// Build post content
			const postContent = <PostContent

				user={this.props.user}
				post={this.props.post}

				getProfileFromID={this.props.getProfileFromID}
				getTopicFromID={this.props.getTopicFromID}

				sendPost={this.props.sendPost}

				promotePost={this.props.promotePost}
				createReport={this.createReport}

				retractPost={this.props.retractPost}
				amendPost={this.props.amendPost}
				
			/>

			// Wrap post content
			if (this.props.omitType) {
				content = postContent;
			} else switch (this.props.post.type) {

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
					content = postContent;

			}

			if (this.state.reporting) {
				reporting = <Report
					user={this.props.user}
					post={this.props.post}
					cancelReport={this.cancelReport}
					reportPost={this.props.reportPost}>
					{postContent}
				</Report>
			}

		}

		// Build feed
		return (
			<div className="post">
				{content}
				{reporting}
			</div>
		);

	}
}

export default Thread;
