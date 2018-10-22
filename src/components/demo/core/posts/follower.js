import React, { Component } from 'react';
import '../../../../App.css';

import PostCore from './postcore';



class FollowerPost extends Component {

	constructor() {
		super()
		this.state = {

		}
	}

	render() {

		// Build feed
		return (
			<div className="follower-post">
				<div className="post-taxonomy follower-taxonomy">following</div>
				<PostCore post={this.props.post} />
			</div>
		);

	}
}

export default FollowerPost;
