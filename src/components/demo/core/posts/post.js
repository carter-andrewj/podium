import React, { Component } from 'react';
import '../../../../App.css';

import FollowerPost from './follower';
import ReplyPost from './reply';
import ReportPost from './report';
import ReactPost from './react';
import RetractedPost from './retracted';
import OwnedPost from './owned';




class Post extends Component {

	constructor() {
		super()
		this.state = {

		}
	}

	render() {

		console.log(this.props);

		let content;
		switch (this.props.post.type) {

			case ("follower"):
				content = <FollowerPost post={this.props.post} />
				break;

			case ("reply"):
				content = <ReplyPost post={this.props.post} />
				break;

			case ("report"):
				content = <ReportPost post={this.props.post} />
				break;

			case ("react"):
				content = <ReactPost post={this.props.post} />
				break;

			case ("retraction"):
				content = <RetractedPost post={this.props.post} />
				break;

			case ("owned"):
				content = <OwnedPost post={this.props.post} />
				break;

			default:
				content = <div></div>

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
