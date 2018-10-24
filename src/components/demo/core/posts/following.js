import React, { Component } from 'react';
import '../../../../App.css';



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
				<div className="post-taxonomy follower-taxonomy">
					<div className="taxonomy-holder">
						<p className="taxonomy-text">following</p>
					</div>
				</div>
				{this.props.children}
			</div>
		);

	}
}

export default FollowingPost;
