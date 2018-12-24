import React, { Component } from 'react';



class FollowingPost extends Component {

	constructor() {
		super()
		this.state = {

		}
	}

	render() {

		// Build feed
		return (
			<div className="following-post">
				{this.props.children}
			</div>
		);

	}
}

export default FollowingPost;
