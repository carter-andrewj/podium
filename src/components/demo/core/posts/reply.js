import React, { Component } from 'react';
import '../../../../App.css';

import Post from './post';




class ReplyPost extends Component {

	constructor() {
		super()
		this.state = {

		}
	}

	render() {

		// Build feed
		return (
			// Fix post definition otherwise this will create an infinite
			// loop as the same this.props.post is being passed back up
			<div className="reply-post">
				<Post post={this.props.post.genesis} />
				<div className="reply-history"></div>
				<Post post={this.props.post.parent} />
				<div className="reply-spacer"></div>
				<Post post={this.props.post} />
			</div>
		);

	}
}

export default ReplyPost;
